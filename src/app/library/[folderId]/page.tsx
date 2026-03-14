export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { createStep, deleteStep } from "../actions";
import Link from "next/link";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
      <div style={{ marginBottom: 32 }}>
        <Link href="/library" style={{
          color: "var(--text-muted)",
          fontSize: 13,
          textDecoration: "none",
          fontFamily: "var(--font-sans)",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
        }}>
          ← Back to Library
        </Link>
        <h1 style={{
          color: "var(--text)",
          fontFamily: "var(--font-sans)",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 4,
        }}>
          📁 {folder.name}
        </h1>
        {folder.description && (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {folder.description}
          </p>
        )}
      </div>

      {/* Create step form */}
      <form action={createStep} style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 24,
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
      }}>
        <input type="hidden" name="folderId" value={folderId} />
        <div style={{ flex: 1 }}>
          <label style={{
            display: "block",
            color: "var(--text-muted)",
            fontSize: 12,
            fontFamily: "var(--font-sans)",
            marginBottom: 6,
          }}>
            Step Title
          </label>
          <input
            name="title"
            placeholder="e.g. Install main bracket"
            required
            style={{
              width: "100%",
              background: "var(--surface-high)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "var(--text)",
              fontSize: 13,
              fontFamily: "var(--font-sans)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{
            display: "block",
            color: "var(--text-muted)",
            fontSize: 12,
            fontFamily: "var(--font-sans)",
            marginBottom: 6,
          }}>
            Description (optional)
          </label>
          <input
            name="description"
            placeholder="Brief description..."
            style={{
              width: "100%",
              background: "var(--surface-high)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "var(--text)",
              fontSize: 13,
              fontFamily: "var(--font-sans)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button type="submit" style={{
          background: "var(--accent)",
          border: "none",
          borderRadius: 8,
          padding: "10px 20px",
          color: "#fff",
          fontSize: 13,
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}>
          + Add Step
        </button>
      </form>

      {/* Steps list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps?.map((step, index) => (
          <div key={step.id} style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{
              width: 28,
              height: 28,
              background: "var(--accent)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {index + 1}
            </div>
            <Link href={`/library/${folderId}/${step.id}`} style={{
              flex: 1,
              color: "var(--text)",
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 500,
            }}>
              {step.title}
              {step.description && (
                <span style={{
                  color: "var(--text-muted)",
                  fontSize: 12,
                  marginLeft: 10,
                  fontWeight: 400,
                }}>
                  {step.description}
                </span>
              )}
            </Link>
            <form action={deleteStep.bind(null, step.id, folderId)}>
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
                Delete
              </button>
            </form>
          </div>
        ))}
        {(!steps || steps.length === 0) && (
          <div style={{
            color: "var(--text-muted)",
            fontSize: 13,
            textAlign: "center",
            padding: "48px 0",
            background: "var(--surface)",
            borderRadius: 12,
            border: "1px solid var(--border)",
          }}>
            No steps yet — add one above
          </div>
        )}
      </div>
    </div>
  );
}