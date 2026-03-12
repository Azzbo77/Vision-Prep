export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { createBuild, deleteBuild } from "./actions";
import Link from "next/link";

const statusColors: Record<string, string> = {
  DRAFT: "var(--text-dim)",
  ACTIVE: "var(--accent)",
  PAUSED: "var(--warning)",
  COMPLETED: "var(--success)",
  ARCHIVED: "var(--text-dim)",
};

export default async function BuildsPage() {
  const { data: builds } = await supabase
    .from("Build")
    .select("*, buildSteps:BuildStep(count)")
    .order("createdAt", { ascending: false });

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700 }}>
            Builds
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            All jobs and assembly runs
          </p>
        </div>
      </div>

      {/* Create build form */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}>
        <h2 style={{ color: "var(--text)", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          New Build
        </h2>
        <form action={createBuild} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            name="title"
            placeholder="Build title"
            required
            style={{
              flex: 1,
              minWidth: 200,
              background: "var(--surface-high)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "var(--text)",
              fontSize: 13,
              fontFamily: "var(--font-sans)",
              outline: "none",
            }}
          />
          <input
            name="description"
            placeholder="Description (optional)"
            style={{
              flex: 2,
              minWidth: 200,
              background: "var(--surface-high)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "var(--text)",
              fontSize: 13,
              fontFamily: "var(--font-sans)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              background: "var(--accent)",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            + New Build
          </button>
        </form>
      </div>

      {/* Builds list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(!builds || builds.length === 0) && (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 40,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
          }}>
            No builds yet — create one above
          </div>
        )}
        {builds?.map((build) => {
          const statusColor = statusColors[build.status] ?? "var(--text-muted)";
          return (
            <div
              key={build.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ fontSize: 22 }}>🔧</div>
              <Link
                href={`/builds/${build.id}`}
                style={{ textDecoration: "none", flex: 1 }}
              >
                <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>
                  {build.title}
                </div>
                {build.description && (
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>
                    {build.description}
                  </div>
                )}
              </Link>
              <div style={{
                background: `${statusColor}22`,
                color: statusColor,
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}>
                {build.status}
              </div>
              <form action={deleteBuild.bind(null, build.id)}>
                <button
                  type="submit"
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "5px 12px",
                    color: "var(--text-muted)",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Delete
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}