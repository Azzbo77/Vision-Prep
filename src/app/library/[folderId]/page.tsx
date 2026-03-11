import { supabase } from "@/lib/supabase";
import { createStep, deleteStep } from "../actions";
import Link from "next/link";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;

  const { data: folder } = await supabase
    .from("Folder")
    .select("*")
    .eq("id", folderId)
    .single();

  const { data: steps } = await supabase
    .from("Step")
    .select("*")
    .eq("folderId", folderId)
    .order("createdAt", { ascending: true });

  if (!folder) {
    return (
      <div style={{ padding: 32, color: "var(--text-muted)" }}>
        Folder not found
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/library"
          style={{
            color: "var(--text-muted)",
            fontSize: 13,
            textDecoration: "none",
            fontFamily: "var(--font-sans)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
          }}
        >
          ← Back to Library
        </Link>
        <h1 style={{
          color: "var(--text)",
          fontFamily: "var(--font-sans)",
          fontSize: 22,
          fontWeight: 700,
        }}>
          📂 {folder.name}
        </h1>
        {folder.description && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            {folder.description}
          </p>
        )}
      </div>

      {/* Create step form */}
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
          New Step
        </h2>
        <form action={createStep} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="hidden" name="folderId" value={folderId} />
          <input
            name="title"
            placeholder="Step title"
            required
            style={{
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
          <textarea
            name="description"
            placeholder="Step description"
            rows={3}
            style={{
              background: "var(--surface-high)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "var(--text)",
              fontSize: 13,
              fontFamily: "var(--font-sans)",
              outline: "none",
              resize: "vertical",
            }}
          />
          <div>
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
              + Add Step
            </button>
          </div>
        </form>
      </div>

      {/* Steps list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(!steps || steps.length === 0) && (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 40,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
          }}>
            No steps yet — add one above
          </div>
        )}
        {steps?.map((step, index) => (
          <div
            key={step.id}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "18px 24px",
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--surface-high)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              flexShrink: 0,
              marginTop: 2,
            }}>
              {index + 1}
            </div>
            <Link
              href={`/library/${folderId}/${step.id}`}
              style={{ textDecoration: "none", flex: 1 }}
            >
              <div style={{
                color: "var(--text)",
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 4,
              }}>
                {step.title}
              </div>
              {step.description && (
                <div style={{
                  color: "var(--text-muted)",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}>
                  {step.description}
                </div>
              )}
            </Link>
            <form action={deleteStep.bind(null, step.id, folderId)}>
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
        ))}
      </div>
    </div>
  );
}