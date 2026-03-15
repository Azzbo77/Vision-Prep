"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  buildId: string;
  userId: string;
  buildStepIds: string[];
}

interface IssueSummary {
  acknowledged: number;
  resolved: number;
}

export default function IssueNotification({ buildId, userId, buildStepIds }: Props) {
  const [summary, setSummary] = useState<IssueSummary>({ acknowledged: 0, resolved: 0 });
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (buildStepIds.length === 0) return;

    async function checkIssues() {
      const { data } = await supabase
        .from("IssueReport")
        .select("id, status")
        .eq("reporterId", userId)
        .in("buildStepId", buildStepIds)
        .in("status", ["ACKNOWLEDGED", "RESOLVED"]);

      const dismissed = JSON.parse(
        localStorage.getItem(`dismissed-issues-${buildId}`) ?? "[]"
      );

      const unread = (data ?? []).filter((i) => !dismissed.includes(i.id));
      setSummary({
        acknowledged: unread.filter((i) => i.status === "ACKNOWLEDGED").length,
        resolved: unread.filter((i) => i.status === "RESOLVED").length,
      });
    }

    checkIssues();

    const channel = supabase
      .channel(`builder-issues-${buildId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "IssueReport",
        },
        () => checkIssues()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [buildId, userId, buildStepIds.join(",")]);

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    supabase
      .from("IssueReport")
      .select("id, status")
      .eq("reporterId", userId)
      .in("buildStepId", buildStepIds)
      .in("status", ["ACKNOWLEDGED", "RESOLVED"])
      .then(({ data }) => {
        // Only permanently dismiss RESOLVED issues
        // ACKNOWLEDGED issues should reappear when they get resolved
        const existingDismissed = JSON.parse(
          localStorage.getItem(`dismissed-issues-${buildId}`) ?? "[]"
        );
        const resolvedIds = (data ?? [])
          .filter((i) => i.status === "RESOLVED" || i.status === "WONT_FIX")
          .map((i) => i.id);
        
        const newDismissed = [...new Set([...existingDismissed, ...resolvedIds])];
        localStorage.setItem(`dismissed-issues-${buildId}`, JSON.stringify(newDismissed));
        setSummary({ acknowledged: 0, resolved: 0 });
      });
  }

  const total = summary.acknowledged + summary.resolved;
  if (total === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 100,
        background: "var(--surface)",
        border: "1px solid var(--accent)",
        borderRadius: 12,
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        maxWidth: 320,
        cursor: "pointer",
      }}
      onClick={() => router.push(`/builder/${buildId}/issues`)}
    >
      <div style={{
        width: 36,
        height: 36,
        background: "var(--accent)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        flexShrink: 0,
        marginTop: 2,
      }}>
        🔔
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          color: "var(--text)",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          marginBottom: 6,
        }}>
          Issue updates
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {summary.acknowledged > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--warning)",
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 12,
                color: "var(--warning)",
                fontFamily: "var(--font-sans)",
              }}>
                {summary.acknowledged} acknowledged
              </span>
            </div>
          )}
          {summary.resolved > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--success)",
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 12,
                color: "var(--success)",
                fontFamily: "var(--font-sans)",
              }}>
                {summary.resolved} resolved
              </span>
            </div>
          )}
        </div>
        <div style={{
          color: "var(--text-dim)",
          fontSize: 11,
          fontFamily: "var(--font-sans)",
          marginTop: 6,
        }}>
          Tap to view details
        </div>
      </div>

      <button
        onClick={handleDismiss}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          fontSize: 16,
          cursor: "pointer",
          padding: 4,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
