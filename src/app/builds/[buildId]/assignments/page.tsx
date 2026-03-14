export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { assignBuilder, unassignBuilder } from "../../actions";
import Link from "next/link";

export default async function AssignmentsPage({
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

  if (!build) redirect("/builds");

  // Get all builders
  const { data: builders } = await supabase
    .from("User")
    .select("id, name, email")
    .eq("role", "BUILDER")
    .order("name", { ascending: true });

  // Get current assignments for this build
  const { data: assignments } = await supabase
    .from("BuildAssignment")
    .select("id, userId")
    .eq("buildId", buildId);

  const assignedUserIds = new Set(assignments?.map((a) => a.userId) ?? []);

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <div style={{ marginBottom: 32 }}>
        <Link href={`/builds/${buildId}`} style={{
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
          Assignments
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Assign builders to <strong style={{ color: "var(--text)" }}>{build.title}</strong>
        </p>
      </div>

      {/* Currently assigned */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}>
        <h2 style={{
          color: "var(--text)",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 16,
        }}>
          Assigned Builders ({assignments?.length ?? 0})
        </h2>
        {(!assignments || assignments.length === 0) ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
            No builders assigned yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {assignments.map((assignment) => {
              const builder = builders?.find((b) => b.id === assignment.userId);
              return (
                <div key={assignment.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "var(--surface-high)",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    background: "var(--accent)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {builder?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 500 }}>
                      {builder?.name ?? "Unknown"}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                      {builder?.email}
                    </div>
                  </div>
                  <form action={unassignBuilder.bind(null, assignment.id, buildId)}>
                    <button type="submit" style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "4px 12px",
                      color: "var(--danger)",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                    }}>
                      Remove
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available builders */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
      }}>
        <h2 style={{
          color: "var(--text)",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 16,
        }}>
          Available Builders
        </h2>
        {(!builders || builders.length === 0) ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
            No builders found — invite builders from the user management page
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {builders.map((builder) => {
              const isAssigned = assignedUserIds.has(builder.id);
              return (
                <div key={builder.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "var(--surface-high)",
                  borderRadius: 8,
                  border: `1px solid ${isAssigned ? "var(--success)" : "var(--border)"}`,
                  opacity: isAssigned ? 0.6 : 1,
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    background: isAssigned ? "var(--success)" : "var(--surface)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isAssigned ? "#fff" : "var(--text-muted)",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                    border: "1px solid var(--border)",
                  }}>
                    {isAssigned ? "✓" : builder.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 500 }}>
                      {builder.name}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                      {builder.email}
                    </div>
                  </div>
                  {isAssigned ? (
                    <span style={{
                      color: "var(--success)",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                    }}>
                      Assigned
                    </span>
                  ) : (
                    <form action={assignBuilder.bind(null, buildId, builder.id)}>
                      <button type="submit" style={{
                        background: "var(--accent)",
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 12px",
                        color: "#fff",
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                      }}>
                        Assign
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
