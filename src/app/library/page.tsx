export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createFolder, deleteFolder } from "./actions";

export default async function LibraryPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: folders } = await supabase
    .from("Folder")
    .select("*, steps:Step(id)")
    .order("createdAt", { ascending: false });

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          color: "var(--text)",
          fontFamily: "var(--font-sans)",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 4,
        }}>
          Library
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Manage your instruction folders and steps
        </p>
      </div>
      {/* Create folder form */}
      <form action={createFolder} style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 24,
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
      }}>
        <div style={{ flex: 1 }}>
          <label style={{
            display: "block",
            color: "var(--text-muted)",
            fontSize: 12,
            fontFamily: "var(--font-sans)",
            marginBottom: 6,
          }}>
            Folder Name
          </label>
          <input
            name="name"
            placeholder="e.g. Chassis Assembly"
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
          + New Folder
        </button>
      </form>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {folders?.map((folder) => (
          <div key={folder.id} style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <Link href={`/library/${folder.id}`} style={{
              flex: 1,
              color: "var(--text)",
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 500,
            }}>
              📁 {folder.name}
              <span style={{
                color: "var(--text-muted)",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                marginLeft: 12,
              }}>
                {folder.steps?.length ?? 0} steps
              </span>
            </Link>
            <form action={deleteFolder.bind(null, folder.id)}>
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
        {(!folders || folders.length === 0) && (
          <div style={{
            color: "var(--text-muted)",
            fontSize: 13,
            textAlign: "center",
            padding: "48px 0",
            background: "var(--surface)",
            borderRadius: 12,
            border: "1px solid var(--border)",
          }}>
            No folders yet — create one above
          </div>
        )}
      </div>
    </div>
  );
}