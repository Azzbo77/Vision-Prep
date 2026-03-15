"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { completeStep, uncompleteStep, reportIssue, skipStep } from "./actions";
import AnnotationViewer from "./AnnotationViewer";
import IssueNotification from "./IssueNotification";

interface Part {
  id: string;
  name: string;
  category: string | null;
}

interface StepPart {
  id: string;
  quantity: number;
  notes: string | null;
  part: Part;
}

interface StepImage {
  id: string;
  url: string;
  annotations: object[] | null;
}

interface Step {
  id: string;
  title: string;
  description: string;
  critical: boolean;
  images: StepImage[];
  parts: StepPart[];
}

interface BuildStep {
  id: string;
  order: number;
  section: string | null;
  step: Step;
}

interface Build {
  id: string;
  title: string;
  status: string;
}

interface Props {
  build: Build;
  buildSteps: BuildStep[];
  completedIds: string[];
  userId: string;
}

export default function BuilderView({ build, buildSteps, completedIds, userId }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState(new Set(completedIds));
  const [reporting, setReporting] = useState(false);
  const [issueType, setIssueType] = useState("OTHER");
  const [issueDescription, setIssueDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [skipReason, setSkipReason] = useState("MISSING_PARTS");
  const [skipDescription, setSkipDescription] = useState("");
  const [confirmedCritical, setConfirmedCritical] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setConfirmedCritical(false);
    setSkipping(false);
    setSkipDescription("");
  }, [activeIndex]);

  const activeBuildStep = buildSteps[activeIndex];
  const activeStep = activeBuildStep?.step;
  const totalSteps = buildSteps.length;
  const completedCount = buildSteps.filter((bs) => completed.has(bs.id)).length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isCompleted = completed.has(activeBuildStep?.id);

  async function handleComplete() {
    if (isCompleted) {
      await uncompleteStep(activeBuildStep.id, build.id);
      setCompleted((prev) => {
        const next = new Set(prev);
        next.delete(activeBuildStep.id);
        return next;
      });
    } else {
      await completeStep(activeBuildStep.id, build.id);
      setCompleted((prev) => new Set([...prev, activeBuildStep.id]));
      // Auto advance to next step
      if (activeIndex < totalSteps - 1) {
        setTimeout(() => setActiveIndex(activeIndex + 1), 400);
      }
    }
    router.refresh();
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>

      {/* Sidebar */}
      <div style={{
        width: 260,
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        background: "var(--surface)",
        flexShrink: 0,
      }}>
        {/* Build info */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 6,
          }}>
            {build.title}
          </div>
          <div style={{
            color: "var(--text-muted)",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            marginBottom: 8,
          }}>
            {completedCount}/{totalSteps} steps complete
          </div>
          <div style={{
            height: 3,
            background: "var(--surface-high)",
            borderRadius: 99,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "var(--accent)",
              borderRadius: 99,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>

        {/* Step list */}
        {buildSteps.map((bs, index) => {
          const isDone = completed.has(bs.id);
          const isActive = activeIndex === index;
          return (
            <div
              key={bs.id}
              onClick={() => setActiveIndex(index)}
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: isActive ? "var(--accent-glow)" : "transparent",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "all 0.12s",
              }}
            >
              <div style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                background: isDone ? "var(--success)" : isActive ? "var(--accent)" : "var(--surface-high)",
                color: "#fff",
                fontFamily: "var(--font-mono)",
                border: isDone || isActive ? "none" : "1px solid var(--border)",
              }}>
                {isDone ? "✓" : index + 1}
              </div>
              <span style={{
                fontSize: 12,
                color: isActive ? "var(--text)" : isDone ? "var(--text-muted)" : "var(--text-muted)",
                fontFamily: "var(--font-sans)",
                lineHeight: 1.3,
                flex: 1,
              }}>
                {bs.step?.title}
              </span>
              {bs.step?.critical && !completed.has(bs.id) && (
                <span style={{ color: "var(--danger)", fontSize: 10 }}>⚠</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
        {activeStep && (
          <div style={{ maxWidth: 720 }}>
            {/* Step header */}
            <div style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}>
              Step {activeIndex + 1} of {totalSteps}
              {activeBuildStep.section && ` · ${activeBuildStep.section}`}
            </div>
            <h2 style={{
              color: "var(--text)",
              fontFamily: "var(--font-sans)",
              fontSize: 24,
              fontWeight: 700,
              margin: "0 0 12px",
            }}>
              {activeStep.title}
            </h2>
            {activeStep.description && (
              <p style={{
                color: "var(--text-muted)",
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 24,
              }}>
                {activeStep.description}
              </p>
            )}

            {/* Images with annotations */}
            {activeStep.images?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                {activeStep.images.map((image) => (
                  <AnnotationViewer
                    key={image.id}
                    imageUrl={image.url}
                    annotations={image.annotations ?? []}
                  />
                ))}
              </div>
            )}

            {/* Parts */}
            {activeStep.parts?.length > 0 && (
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "16px 20px",
                marginBottom: 24,
              }}>
                <div style={{
                  color: "var(--text-muted)",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 12,
                }}>
                  Required Parts & Tools
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {activeStep.parts.map((sp) => (
                    <div
                      key={sp.id}
                      style={{
                        background: "var(--surface-high)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: "5px 12px",
                        fontSize: 12,
                        color: "var(--text)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      🔩 {sp.part?.name}
                      {sp.quantity > 1 && (
                        <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>
                          ×{sp.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Critical confirmation */}
            {activeStep.critical && !isCompleted && (
              <div style={{
                background: "rgba(255,77,106,0.08)",
                border: "1px solid var(--danger)",
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <input
                  type="checkbox"
                  id="critical-confirm"
                  checked={confirmedCritical}
                  onChange={(e) => setConfirmedCritical(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }}
                />
                <label htmlFor="critical-confirm" style={{
                  color: "var(--danger)",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  lineHeight: 1.4,
                }}>
                  ⚠ This is a critical step. I confirm I have completed it correctly and checked my work.
                </label>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleComplete}
                disabled={activeStep.critical && !confirmedCritical && !isCompleted}
                style={{
                  flex: 1,
                  background: isCompleted ? "var(--success)" : "var(--accent)",
                  border: "none",
                  borderRadius: 10,
                  padding: 14,
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  cursor: (activeStep.critical && !confirmedCritical && !isCompleted) ? "not-allowed" : "pointer",
                  opacity: (activeStep.critical && !confirmedCritical && !isCompleted) ? 0.5 : 1,
                  transition: "background 0.2s",
                }}
              >
                {isCompleted ? "✓ Completed — Click to Undo" : "Mark as Complete"}
              </button>
              {!isCompleted && (
                <button
                  onClick={() => { setSkipping(!skipping); setReporting(false); }}
                  style={{
                    background: skipping ? "rgba(122,131,158,0.15)" : "var(--surface)",
                    border: `1px solid ${skipping ? "var(--text-muted)" : "var(--border)"}`,
                    borderRadius: 10,
                    padding: "14px 20px",
                    color: "var(--text-muted)",
                    fontSize: 13,
                    fontFamily: "var(--font-sans)",
                    cursor: "pointer",
                  }}
                >
                  Skip
                </button>
              )}
              <button
                onClick={() => { setReporting(!reporting); setSkipping(false); }}
                style={{
                  background: reporting ? `rgba(245,166,35,0.1)` : "var(--surface)",
                  border: `1px solid ${reporting ? "var(--warning)" : "var(--border)"}`,
                  borderRadius: 10,
                  padding: "14px 20px",
                  color: reporting ? "var(--warning)" : "var(--text-muted)",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                {reporting ? "⚠ Reporting..." : "Flag Issue"}
              </button>
            </div>

            {/* Skip form */}
            {skipping && (
              <div style={{
                marginTop: 14,
                background: "rgba(122,131,158,0.05)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "16px 20px",
              }}>
                <div style={{
                  color: "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 12,
                  fontFamily: "var(--font-sans)",
                }}>
                  Skip Reason
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {[
                    { value: "MISSING_PARTS", label: "Parts" },
                    { value: "WRONG_TOOL", label: "Tooling" },
                    { value: "UNCLEAR_INSTRUCTIONS", label: "Instructions" },
                    { value: "OTHER", label: "Other" },
                  ].map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setSkipReason(r.value)}
                      style={{
                        background: skipReason === r.value ? "rgba(122,131,158,0.2)" : "var(--surface-high)",
                        border: `1px solid ${skipReason === r.value ? "var(--text-muted)" : "var(--border)"}`,
                        borderRadius: 6,
                        padding: "5px 12px",
                        fontSize: 12,
                        color: skipReason === r.value ? "var(--text)" : "var(--text-muted)",
                        cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Additional notes (optional)..."
                  value={skipDescription}
                  onChange={(e) => setSkipDescription(e.target.value)}
                  rows={2}
                  style={{
                    width: "100%",
                    background: "var(--surface-high)",
                    border: "1px solid var(--border)",
                    borderRadius: 7,
                    padding: "10px 12px",
                    color: "var(--text)",
                    fontSize: 13,
                    fontFamily: "var(--font-sans)",
                    resize: "none",
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: 10,
                  }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={async () => {
                      await skipStep(activeBuildStep.id, build.id, skipReason, skipDescription);
                      setSkipping(false);
                      setSkipDescription("");
                      setCompleted((prev) => new Set([...prev, activeBuildStep.id]));
                      if (activeIndex < totalSteps - 1) {
                        setTimeout(() => setActiveIndex(activeIndex + 1), 400);
                      }
                      router.refresh();
                    }}
                    style={{
                      background: "var(--text-muted)",
                      border: "none",
                      borderRadius: 7,
                      padding: "9px 20px",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Confirm Skip
                  </button>
                  <button
                    onClick={() => { setSkipping(false); setSkipDescription(""); }}
                    style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: 7,
                      padding: "9px 16px",
                      color: "var(--text-muted)",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {reporting && (
              <div style={{
                marginTop: 14,
                background: "rgba(245,166,35,0.05)",
                border: "1px solid rgba(245,166,35,0.3)",
                borderRadius: 10,
                padding: "16px 20px",
              }}>
                <div style={{
                  color: "var(--warning)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 12,
                  fontFamily: "var(--font-sans)",
                }}>
                  Report an Issue
                </div>

                {/* Issue type */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {[
                    { value: "WRONG_PART", label: "Wrong Part" },
                    { value: "MISSING_PART", label: "Missing Part" },
                    { value: "WRONG_TOOL", label: "Wrong Tool" },
                    { value: "UNCLEAR_INSTRUCTIONS", label: "Unclear Instructions" },
                    { value: "DAMAGED_COMPONENT", label: "Damaged Component" },
                    { value: "OTHER", label: "Other" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setIssueType(t.value)}
                      style={{
                        background: issueType === t.value ? "rgba(245,166,35,0.15)" : "var(--surface-high)",
                        border: `1px solid ${issueType === t.value ? "var(--warning)" : "var(--border)"}`,
                        borderRadius: 6,
                        padding: "5px 12px",
                        fontSize: 12,
                        color: issueType === t.value ? "var(--warning)" : "var(--text-muted)",
                        cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        transition: "all 0.12s",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Description */}
                <textarea
                  placeholder="Describe the issue..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    background: "var(--surface-high)",
                    border: "1px solid var(--border)",
                    borderRadius: 7,
                    padding: "10px 12px",
                    color: "var(--text)",
                    fontSize: 13,
                    fontFamily: "var(--font-sans)",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: 10,
                  }}
                />

                {/* Submit */}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    onClick={async () => {
                      if (!issueDescription.trim()) return;
                      setSubmitting(true);
                      await reportIssue(
                        activeBuildStep.id,
                        build.id,
                        issueType,
                        issueDescription.trim()
                      );
                      setSubmitting(false);
                      setSubmitted(true);
                      setIssueDescription("");
                      setReporting(false);
                      setTimeout(() => setSubmitted(false), 3000);
                    }}
                    disabled={submitting || !issueDescription.trim()}
                    style={{
                      background: "var(--warning)",
                      border: "none",
                      borderRadius: 7,
                      padding: "9px 20px",
                      color: "#000",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: submitting ? "not-allowed" : "pointer",
                      fontFamily: "var(--font-sans)",
                      opacity: submitting || !issueDescription.trim() ? 0.6 : 1,
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
                  </button>
                  <button
                    onClick={() => { setReporting(false); setIssueDescription(""); }}
                    style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: 7,
                      padding: "9px 16px",
                      color: "var(--text-muted)",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {submitted && (
              <div style={{
                marginTop: 10,
                background: "rgba(46,204,138,0.1)",
                border: "1px solid var(--success)",
                borderRadius: 8,
                padding: "10px 16px",
                color: "var(--success)",
                fontSize: 13,
                fontFamily: "var(--font-sans)",
              }}>
                ✓ Issue reported — supervisor has been notified
              </div>
            )}

            {/* Build complete banner */}
            {completedCount === totalSteps && totalSteps > 0 && (
              <div style={{
                background: "rgba(46, 204, 138, 0.1)",
                border: "1px solid var(--success)",
                borderRadius: 12,
                padding: "20px 24px",
                marginTop: 24,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div style={{
                  color: "var(--success)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 4,
                }}>
                  Build Complete!
                </div>
                <div style={{
                  color: "var(--text-muted)",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                }}>
                  All {totalSteps} steps completed.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 20,
            }}>
              <button
                onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "8px 16px",
                  color: activeIndex === 0 ? "var(--text-dim)" : "var(--text-muted)",
                  fontSize: 13,
                  cursor: activeIndex === 0 ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                ← Previous
              </button>
              <button
                onClick={() => setActiveIndex(Math.min(totalSteps - 1, activeIndex + 1))}
                disabled={activeIndex === totalSteps - 1}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "8px 16px",
                  color: activeIndex === totalSteps - 1 ? "var(--text-dim)" : "var(--text-muted)",
                  fontSize: 13,
                  cursor: activeIndex === totalSteps - 1 ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
      <IssueNotification
        buildId={build.id}
        userId={userId}
        buildStepIds={buildSteps.map((bs) => bs.id)}
      />
    </div>
  );
}