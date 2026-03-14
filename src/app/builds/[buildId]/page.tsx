export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { addStepToBuild, removeStepFromBuild, updateBuildStatus } from "../actions";
import Link from "next/link";
import StepLibrary from "./StepLibrary";

export default async function BuildPage({
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
    .select("*")
    .eq("id", buildId)
    .single();

  const { data: buildSteps } = await supabase
    .from("BuildStep")
    .select("*, step:Step(id, title, description)")
    .eq("buildId", buildId)
    .order("order", { ascending: true });

  const { data: allSteps } = await supabase
    .from("Step")
    .select("*, folder:Folder(name)")
    .order("createdAt", { ascending: true });

  if (!build) {
    return <div style={{ padding: 32, color: "var(--text-muted)" }}>Build not found</div>;
  }

  const linkedStepIds = new Set(buildSteps?.map((bs) => bs.stepId) ?? []);
  const nextOrder = (buildSteps?.length ?? 0) + 1;

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/builds" style={{
          color: "var(--text-muted)",
          fontSize: 13,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
        }}>
          ← Back to Builds
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <h1 style={{
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
            fontSize: 22,
            fontWeight: 700,
          }}>
            🔧 {build.title}
          </h1>
          <span style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: build.status === "ACTIVE" ? "var(--accent)" : "var(--text-muted)",
            background: build.status === "ACTIVE" ? "rgba(79,127,255,0.1)" : "var(--surface-high)",
            border: `1px solid ${build.status === "ACTIVE" ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 99,
            padding: "3px 10px",
          }}>
            {build.status}
          </span>
        </div>
        {build.description && (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{build.description}</p>
        )}
      </div>

      {/* Status actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
        {build.status === "DRAFT" && (
          <form action={updateBuildStatus.bind(null, buildId, "ACTIVE")}>
            <button type="submit" style={{
              background: "var(--accent)",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}>
              Activate Build
            </button>
          </form>
        )}
        {build.status === "ACTIVE" && (
          <>
            <form action={updateBuildStatus.bind(null, buildId, "PAUSED")}>
              <button type="submit" style={{
                background: "none",
                border: "1px solid var(--warning)",
                borderRadius: 8,
                padding: "10px 20px",
                color: "var(--warning)",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}>
                Pause Build
              </button>
            </form>
            <Link href={`/builder/${buildId}`} style={{
              background: "var(--success)",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              textDecoration: "none",
              display: "inline-block",
            }}>
              → Open in Builder
            </Link>
          </>
        )}
        {build.status === "PAUSED" && (
          <form action={updateBuildStatus.bind(null, buildId, "ACTIVE")}>
            <button type="submit" style={{
              background: "var(--accent)",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}>
              Resume Build
            </button>
          </form>
        )}
        <Link href={`/builds/${buildId}/assignments`} style={{
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 20px",
          color: "var(--text-muted)",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          textDecoration: "none",
          display: "inline-block",
        }}>
          👥 Manage Assignments
        </Link>
      </div>

      {/* Linked steps */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}>
        <h2 style={{ color: "var(--text)", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          Steps in this Build ({buildSteps?.length ?? 0})
        </h2>
        {(!buildSteps || buildSteps.length === 0) ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
            No steps linked yet — add from the library below
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {buildSteps.map((bs, index) => (
              <div key={bs.id} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                background: "var(--surface-high)",
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}>
                <span style={{
                  width: 24,
                  height: 24,
                  background: "var(--accent)",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {index + 1}
                </span>
                <span style={{ flex: 1, color: "var(--text)", fontSize: 13 }}>
                  {bs.step?.title}
                </span>
                <form action={removeStepFromBuild.bind(null, bs.id, buildId)}>
                  <button type="submit" style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "3px 10px",
                    color: "var(--danger)",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}>
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step library */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
      }}>
        <h2 style={{ color: "var(--text)", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          Add from Library
        </h2>
        <StepLibrary
          buildId={buildId}
          allSteps={allSteps ?? []}
          linkedStepIds={Array.from(linkedStepIds)}
          nextOrder={nextOrder}
        />
      </div>
    </div>
  );
}