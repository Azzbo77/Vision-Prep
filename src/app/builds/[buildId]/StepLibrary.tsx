"use client";

import { useRouter } from "next/navigation";
import { addStepToBuild } from "../actions";

interface Step {
  id: string;
  title: string;
  folder: { name: string } | null;
}

interface Props {
  buildId: string;
  allSteps: Step[];
  linkedStepIds: string[];
  nextOrder: number;
}

export default function StepLibrary({ buildId, allSteps, linkedStepIds, nextOrder }: Props) {
  const router = useRouter();
  const linkedSet = new Set(linkedStepIds);

  async function handleAdd(stepId: string) {
    await addStepToBuild(buildId, stepId, nextOrder);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {allSteps.map((step) => {
        const isLinked = linkedSet.has(step.id);
        return (
          <div
            key={step.id}
            style={{
              background: "var(--surface-high)",
              border: `1px solid ${isLinked ? "var(--success)" : "var(--border)"}`,
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: isLinked ? 0.6 : 1,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 500 }}>
                {step.title}
              </div>
              {step.folder && (
                <div style={{ color: "var(--text-dim)", fontSize: 11, marginTop: 2, fontFamily: "var(--font-mono)" }}>
                  📁 {step.folder.name}
                </div>
              )}
            </div>
            {isLinked ? (
              <span style={{ color: "var(--success)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                ✓ Added
              </span>
            ) : (
              <button
                onClick={() => handleAdd(step.id)}
                style={{
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: 6,
                  padding: "5px 12px",
                  color: "#fff",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                + Add
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
