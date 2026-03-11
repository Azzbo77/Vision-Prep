"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface BuildStep {
  id: string;
  completions: { id: string }[];
}

interface Build {
  id: string;
  title: string;
  status: string;
  customerRef: string | null;
  buildSteps: BuildStep[];
}

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
  initialBuilds: Build[];
  initialIssues: Issue[];
}

const statusColors: Record<string, string> = {
  DRAFT: "var(--text-dim)",
  ACTIVE: "var(--accent)",
  PAUSED: "var(--warning)",
  COMPLETED: "var(--success)",
};

export default function DashboardClient({ initialBuilds, initialIssues }: Props) {
  const [builds, setBuilds] = useState(initialBuilds);
  const [issues, setIssues] = useState(initialIssues);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to StepCompletion changes
    const channel = supabase
      .channel("dashboard-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "StepCompletion" },
        async () => {
          // Refetch builds with updated completion counts
          const { data } = await supabase
            .from("Build")
            .select(`
              *,
              buildSteps:BuildStep(
                id,
                completions:StepCompletion(id)
              )
            `)
            .neq("status", "ARCHIVED")
            .order("createdAt", { ascending: false });

          if (data) {
            setBuilds(data);
            setLastUpdate(new Date().toLocaleTimeString());
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "IssueReport" },
        async () => {
          const { data } = await supabase
            .from("IssueReport")
            .select(`
              *,
              buildStep:BuildStep(
                id,
                step:Step(title)
              )
            `)
            .eq("status", "OPEN")
            .order("createdAt", { ascending: false })
            .limit(10);

          if (data) setIssues(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const activeBuilds = builds.filter((b) => b.status === "ACTIVE").length;
  const totalStepsToday = builds.reduce((acc, b) =>
    acc + b.buildSteps.reduce((a, bs) => a + bs.completions.length, 0), 0
  );
  const openIssues = issues.length;
  const completedBuilds = builds.filter((b) => b.status === "COMPLETED").length;

  const stats = [
    { label: "Active Builds", value: activeBuilds, icon: "⚡", color: "var(--accent)" },
    { label: "Steps Completed", value: totalStepsToday, icon: "✓", color: "var(--success)" },
    { label: "Open Issues", value: openIssues, icon: "!", color: "var(--warning)" },
    { label: "Completed Builds", value: completedBuilds, icon: "★", color: "#A78BFA" },
  ];

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <h1 style={{
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
            fontSize: 22,
            fontWeight: 700,
          }}>
            Live Dashboard
          </h1>
          {lastUpdate && (
            <span style={{
              color: "var(--success)",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              background: "rgba(46,204,138,0.1)",
              border: "1px solid var(--success)",
              borderRadius: 99,
              padding: "2px 10px",
            }}>
              ● Updated {lastUpdate}
            </span>
          )}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Real-time overview of all active builds
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        marginBottom: 28,
      }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "20px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute",
              top: -10, right: -10,
              fontSize: 52,
              opacity: 0.06,
            }}>
              {s.icon}
            </div>
            <div style={{
              fontSize: 28,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: s.color,
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: 12,
              color: "var(--text-muted)",
              marginTop: 4,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Builds + Issues */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: 20,
      }}>
        {/* Active builds */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
        }}>
          <h3 style={{
            color: "var(--text)",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 20,
          }}>
            Build Progress
          </h3>
          {builds.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
              No builds yet
            </div>
          )}
          {builds.map((build) => {
            const total = build.buildSteps.length;
            const done = build.buildSteps.reduce(
              (acc, bs) => acc + bs.completions.length, 0
            );
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const statusColor = statusColors[build.status] ?? "var(--text-muted)";

            return (
              <div key={build.id} style={{ marginBottom: 20 }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}>
                  <Link
                    href={`/builds/${build.id}`}
                    style={{
                      color: "var(--text)",
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    {build.title}
                  </Link>
                  <span style={{
                    color: "var(--text-muted)",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                  }}>
                    {done}/{total}
                  </span>
                </div>
                <div style={{
                  height: 5,
                  background: "var(--surface-high)",
                  borderRadius: 99,
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: statusColor,
                    borderRadius: 99,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}>
                  <span style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                  }}>
                    {build.status}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: statusColor,
                    fontFamily: "var(--font-mono)",
                  }}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Open issues */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
        }}>
          <h3 style={{
            color: "var(--text)",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 20,
          }}>
            Open Issues
          </h3>
          {issues.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
              No open issues
            </div>
          )}
          {issues.map((issue) => (
            <div
              key={issue.id}
              style={{
                background: "var(--surface-high)",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 10,
                borderLeft: "3px solid var(--danger)",
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}>
                <span style={{
                  fontSize: 11,
                  color: "var(--danger)",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                }}>
                  {issue.type.replace(/_/g, " ")}
                </span>
                <span style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                }}>
                  {new Date(issue.createdAt).toLocaleTimeString()}
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
                }}>
                  Step: {issue.buildStep.step.title}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}