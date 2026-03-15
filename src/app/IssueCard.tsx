"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acknowledgeIssue, resolveIssue } from "@/app/issues/actions";

interface Issue {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  buildStep: {
    step: { title: string } | null;
  } | null;
}

interface Props {
  issue: Issue;
}

export default function IssueCard({ issue }: Props) {
  const router = useRouter();
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const statusColors: Record<string, string> = {
    OPEN: "var(--danger)",
    ACKNOWLEDGED: "var(--warning)",
    RESOLVED: "var(--success)",
    WONT_FIX: "var(--text-dim)",
  };

  const color = statusColors[issue.status] ?? "var(--text-muted)";

  async function handleAcknowledge() {
    setLoading(true);
    await acknowledgeIssue(issue.id);
    setLoading(false);
    router.refresh();
  }

  async function handleResolve() {
    setLoading(true);
    await resolveIssue(issue.id, note);
    setLoading(false);
    setResolving(false);
    setNote("");
    router.refresh();
  }

  return (
    <div style={{
      background: "var(--surface-high)",
      borderRadius: 8,
      padding: "12px 14px",
      marginBottom: 10,
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 11,
          color,
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
        }}>
          {issue.type.replace(/_/g, " ")}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
          }}
          suppressHydrationWarning
        >
          {new Date(issue.createdAt).toISOString().substring(11, 16)}
        </span>
      </div>

      <div style={{
        fontSize: 12,
        color: "var(--text)",
        marginBottom: 4,
      }}>
        {issue.description}
      </div>

      {issue.buildStep?.step && (
        <div style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginBottom: 8,
        }}>
          Step: {issue.buildStep.step.title}
        </div>
      )}

      {/* Status badge */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}>
        <span style={{
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          color,
          background: `${color}22`,
          border: `1px solid ${color}`,
          borderRadius: 99,
          padding: "2px 8px",
          textTransform: "uppercase",
        }}>
          {issue.status.replace(/_/g, " ")}
        </span>

        <div style={{ display: "flex", gap: 6 }}>
          {issue.status === "OPEN" && (
            <button
              onClick={handleAcknowledge}
              disabled={loading}
              style={{
                background: "rgba(245,166,35,0.1)",
                border: "1px solid var(--warning)",
                borderRadius: 5,
                padding: "3px 10px",
                color: "var(--warning)",
                fontSize: 11,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              Acknowledge
            </button>
          )}
          {(issue.status === "OPEN" || issue.status === "ACKNOWLEDGED") && (
            <button
              onClick={() => setResolving(!resolving)}
              disabled={loading}
              style={{
                background: "rgba(46,204,138,0.1)",
                border: "1px solid var(--success)",
                borderRadius: 5,
                padding: "3px 10px",
                color: "var(--success)",
                fontSize: 11,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              Resolve
            </button>
          )}
        </div>
      </div>

      {/* Resolution form */}
      {resolving && (
        <div style={{ marginTop: 10 }}>
          <textarea
            placeholder="Resolution note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            style={{
              width: "100%",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 10px",
              color: "var(--text)",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 6,
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={handleResolve}
              disabled={loading}
              style={{
                background: "var(--success)",
                border: "none",
                borderRadius: 5,
                padding: "5px 14px",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              {loading ? "Resolving..." : "Confirm Resolve"}
            </button>
            <button
              onClick={() => { setResolving(false); setNote(""); }}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: 5,
                padding: "5px 10px",
                color: "var(--text-muted)",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
