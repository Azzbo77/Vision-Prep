export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { deleteUser } from "../actions";
import { InviteForm } from "./InviteForm";

const roleColors: Record<string, string> = {
  ADMIN: "#A78BFA",
  SUPERVISOR: "var(--accent)",
  BUILDER: "var(--success)",
};

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") redirect("/");

  const { data: users } = await supabase
    .from("User")
    .select("*")
    .order("createdAt", { ascending: false });

  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          color: "var(--text)",
          fontFamily: "var(--font-sans)",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 4,
        }}>
          User Management
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Invite and manage users
        </p>
      </div>

      {/* Invite form */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}>
        <h2 style={{ color: "var(--text)", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          Invite User
        </h2>
        <InviteForm />
      </div>

      {/* Users list */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
      }}>
        <h2 style={{ color: "var(--text)", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          All Users ({users?.length ?? 0})
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {users?.map((u) => (
            <div key={u.id} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: "var(--surface-high)",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}>
              <div style={{
                width: 36,
                height: 36,
                background: roleColors[u.role] ?? "var(--surface)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {u.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 500 }}>
                  {u.name}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                  {u.email}
                </div>
              </div>
              <span style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: roleColors[u.role] ?? "var(--text-muted)",
                background: `${roleColors[u.role]}22`,
                border: `1px solid ${roleColors[u.role] ?? "var(--border)"}`,
                borderRadius: 99,
                padding: "2px 10px",
              }}>
                {u.role}
              </span>
              {u.id !== user.id && (
                <form action={deleteUser.bind(null, u.id)}>
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
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
