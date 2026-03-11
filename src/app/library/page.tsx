import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createFolder, deleteFolder } from "./actions";

export default async function LibraryPage() {
  const { data: folders } = await supabase
    .from("Folder")
    .select("*, steps:Step(count)")
    .order("createdAt", { ascending: true });

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700 }}>
            Instruction Library
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Organise your reusable steps into folders
          </p>
        </div>
      </div>

      {/* Create folder form */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}>
        <h2 style={{ color: "var(--text)", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          New Folder
        </h2>
        <form action={createFolder} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            name="name"
            placeholder="Folder name"
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
            + Create Folder
          </button>
        </form>
      </div>

      {/* Folder list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(!folders || folders.length === 0) && (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 40,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
          }}>
            No folders yet — create one above to get started
          </div>
        )}
        {folders?.map((folder) => (
          <div
            key={folder.id}
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
            <span style={{ fontSize: 22 }}>📁</span>
            <Link
              href={`/library/${folder.id}`}
              style={{ textDecoration: "none", flex: 1 }}
            >
              <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>
                {folder.name}
              </div>
              {folder.description && (
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>
                  {folder.description}
                </div>
              )}
            </Link>
            <form action={deleteFolder.bind(null, folder.id)}>
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