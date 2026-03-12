"use client";

import { useRouter } from "next/navigation";

interface BuildStep {
  id: string;
  completions: { id: string; userId: string }[];
}

interface Build {
  id: string;
  title: string;
  description: string | null;
  status: string;
  buildSteps: BuildStep[];
}

interface Props {
  allBuilds: Build[];
  assignedBuildIds: string[];
  userId: string;
}

export default function BuilderLanding({ allBuilds, assignedBuildIds, userId }: Props) {
  const router = useRouter();
  const assignedSet = new Set(assignedBuildIds);

  const assignedBuilds = allBuilds.filter((b) => assignedSet.has(b.id));
  const otherBuilds = allBuilds.filter((b) => !assignedSet.has(b.id));

  function getProgress(build: Build) {
    const total = build.buildSteps.length;
    const done = build.buildSteps.filter((bs) =>
      bs.completions.some((c) => c.userId === userId)
    ).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  }

  function BuildCard({ build, assigned }: { build: Build; assigned: boolean }) {
    const { total, done, pct } = getProgress(build);
    const isStarted = done > 0;
    const isComplete = done === total && total > 0;

    return (
      <div
        onClick={() => router.push(`/builder/${build.id}`)}
        style={{
          background: "var(--surface)",
          border: `1px solid ${assigned ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 12,
          padding: "20px 24px",
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            {assigned && (
              <div style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 4,
              }}>
                ★ Assigned to you
              </div>
            )}
            <div style={{
              color: "var(--text)",
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 4,
            }}>
              {build.title}
            </div>
            {build.description && (
              <div style={{
                color: "var(--text-muted)",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
              }}>
                {build.description}
              </div>
            )}
          </div>
          <div style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: isComplete ? "var(--success)" : isStarted ? "var(--warning)" : "var(--text-dim)",
            background: isComplete ? "rgba(46,204,138,0.1)" : isStarted ? "rgba(245,166,35,0.1)" : "var(--surface-high)",
            border: `1px solid ${isComplete ? "var(--success)" : isStarted ? "var(--warning)" : "var(--border)"}`,
            borderRadius: 99,
            padding: "3px 10px",
            flexShrink: 0,
          }}>
            {isComplete ? "Complete" : isStarted ? "In Progress" : "Not Started"}
          </div>
        </div>

        <div style={{
          height: 4,
          background: "var(--surface-high)",
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: 8,
        }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: isComplete ? "var(--success)" : "var(--accent)",
            borderRadius: 99,
            transition: "width 0.4s ease",
          }} />
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: "var(--text-dim)",
        }}>
          <span>{total} steps</span>
          <span>{pct}% complete</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 720 }}>
      <h1 style={{
        color: "var(--text)",
        fontFamily: "var(--font-sans)",
        fontSize: 22,
        fontWeight: 700,
        marginBottom: 4,
      }}>
        Your Builds
      </h1>
      <p style={{
        color: "var(--text-muted)",
        fontSize: 13,
        marginBottom: 32,
      }}>
        Select a build to continue working
      </p>

      {allBuilds.length === 0 && (
        <div style={{
          color: "var(--text-muted)",
          fontSize: 14,
          textAlign: "center",
          padding: "48px 0",
          background: "var(--surface)",
          borderRadius: 12,
          border: "1px solid var(--border)",
        }}>
          No active builds available
        </div>
      )}

      {assignedBuilds.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}>
            Assigned to You
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {assignedBuilds.map((build) => (
              <BuildCard key={build.id} build={build} assigned={true} />
            ))}
          </div>
        </div>
      )}

      {otherBuilds.length > 0 && (
        <div>
          <div style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}>
            All Active Builds
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {otherBuilds.map((build) => (
              <BuildCard key={build.id} build={build} assigned={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
