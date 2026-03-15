export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

const statusColors: Record<string, string> = {
  OPEN: "var(--danger)",
  ACKNOWLEDGED: "var(--warning)",
  RESOLVED: "var(--success)",
  WONT_FIX: "var(--text-dim)",
};

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  ACKNOWLEDGED: "Acknowledged",
  RESOLVED: "Resolved",
  WONT_FIX: "Won't Fix",
};

export default async function BuilderIssuesPage({
  params,
}: {
  params: Promise<{ buildId: string }>;
}) {
  const { buildId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: build } = await supabase
    .from("Build")
    .select("id, title")
    .eq("id", buildId)
    .single();

  const { data: issues } = await supabase
    .from("IssueReport")
    .select(`
      *,
      buildStep:BuildStep(
        id,
        step:Step(title)
      )
    `)
    .eq("reporterId", user.id)
    .in("buildStepId", 
      (await supabase
        .from("BuildStep")
        .select("id")
        .eq("buildId", buildId)
      ).data?.map(bs => bs.id) ?? []
    )
    .order("createdAt", { ascending: false });

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <div style={{ marginBottom: 32 }}>
        <Link href={`/builder/${buildId}`} style={{
          color: "var(--text-muted)",
          fontSize: 13,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
        }}>
          ← Back to Build
        </Link>
        <h1 style={{
          color: "var(--text)",
          fontFamily: "var(--font-sans)",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 4,
        }}>
          My Reported Issues
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Issues you've reported for <strong style={{ color: "var(--text)" }}>{build?.title}</strong>
        </p>
      </div>

      {(!issues || issues.length === 0) ? (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "48px 0",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}>
          No issues reported for this build
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {issues.map((issue) => {
            const color = statusColors[issue.status] ?? "var(--text-muted)";
            return (
              <div key={issue.id} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "16px 20px",
                borderLeft: `4px solid ${color}`,
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}>
                  <div>
                    <div style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}>
                      {issue.type.replace(/_/g, " ")}
                    </div>
                    <div style={{
                      color: "var(--text)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}>
                      {issue.description}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color,
                    background: `${color}22`,
                    border: `1px solid ${color}`,
                    borderRadius: 99,
                    padding: "3px 10px",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}>
                    {statusLabels[issue.status]}
                  </span>
                </div>

                {issue.buildStep?.step && (
                  <div style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 8,
                  }}>
                    Step: {issue.buildStep.step.title}
                  </div>
                )}

                {issue.adminNotes && (
                  <div style={{
                    background: "var(--surface-high)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "8px 12px",
                    marginTop: 8,
                  }}>
                    <div style={{
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}>
                      Resolution Note
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: "var(--text)",
                    }}>
                      {issue.adminNotes}
                    </div>
                  </div>
                )}

                <div style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                  marginTop: 8,
                }}>
                  Reported {new Date(issue.createdAt).toISOString().substring(0, 16).replace("T", " ")}
                  {issue.resolvedAt && ` · Resolved ${new Date(issue.resolvedAt).toISOString().substring(0, 16).replace("T", " ")}`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
