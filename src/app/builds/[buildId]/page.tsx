import { supabase } from "@/lib/supabase";
import { addStepToBuild, removeStepFromBuild, updateBuildStatus } from "../actions";
import Link from "next/link";
import StepLibrary from "./StepLibrary";

export default async function BuildPage({
  params,
}: {
  params: Promise<{ buildId: string }>;
}) {
  const { buildId } = await params;

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
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/builds"
          style={{
            color: "var(--text-muted)",
            fontSize: 13,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
          }}
        >
          ← Back to Builds
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, flex: 1 }}>
            {build.title}
          </h1>
          {build.status === "DRAFT" && (
            <form action={updateBuildStatus.bind(null, buildId, "ACTIVE")}>
              <button
                type="submit"
                style={{
                  background: "var(--success)",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 18px",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                ▶ Activate Build
              </button>
            </form>
          )}
          {build.status === "ACTIVE" && (
            <Link
              href={`/builder/${buildId}`}
              style={{
                background: "var(--accent)",
                borderRadius: 8,
                padding: "8px 18px",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                fontFamily: "var(--font-sans)",
              }}
            >
              → Open in Builder
            </Link>
          )}
        </div>
        {build.description && (
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>
            {build.description}
          </p>
        )}
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
          Build Steps ({buildSteps?.length ?? 0})
        </h2>
        {(!buildSteps || buildSteps.length === 0) && (
          <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "12px 0" }}>
            No steps linked yet — add steps from the library below
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {buildSteps?.map((bs, index) => (
            <div
              key={bs.id}
              style={{
                background: "var(--surface-high)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#fff",
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 500 }}>
                  {bs.step?.title}
                </div>
              </div>
              <form action={removeStepFromBuild.bind(null, bs.id, buildId)}>
                <button
                  type="submit"
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "4px 10px",
                    color: "var(--text-muted)",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
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