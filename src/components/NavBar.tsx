"use client";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const allTabs = [
  { label: "Dashboard", href: "/", roles: ["ADMIN", "SUPERVISOR"] },
  { label: "Builds", href: "/builds", roles: ["ADMIN", "SUPERVISOR"] },
  { label: "Library", href: "/library", roles: ["ADMIN"] },
  { label: "Builder View", href: "/builder", roles: ["ADMIN", "SUPERVISOR", "BUILDER"] },
];

interface Props {
  role: string | null;
}

export default function NavBar({ role }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const tabs = role
    ? allTabs.filter((tab) => tab.roles.includes(role))
    : [];

  return (
    <nav style={{
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      gap: 32,
      height: 56,
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 16 }}>
        <div style={{
          width: 28, height: 28,
          background: "var(--accent)",
          borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>👁</div>
        <span style={{
          color: "var(--text)",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: 1,
        }}>VISION PREP</span>
      </div>

      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              fontSize: 13,
              fontFamily: "var(--font-sans)",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        );
      })}

      {/* Right side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 8, height: 8,
            borderRadius: "50%",
            background: "var(--success)",
            boxShadow: "0 0 6px var(--success)",
          }} />
          <span style={{
            color: "var(--text-muted)",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}>v0.1.0-alpha</span>
        </div>
        {role && (
          <button
            onClick={handleSignOut}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "4px 12px",
              color: "var(--text-muted)",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}