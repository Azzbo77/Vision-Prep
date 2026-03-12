"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogin() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{
          display: "block",
          color: "var(--text-muted)",
          fontSize: 12,
          fontFamily: "var(--font-sans)",
          marginBottom: 6,
        }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
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

      <div>
        <label style={{
          display: "block",
          color: "var(--text-muted)",
          fontSize: 12,
          fontFamily: "var(--font-sans)",
          marginBottom: 6,
        }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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

      {error && (
        <div style={{
          color: "var(--danger)",
          fontSize: 12,
          fontFamily: "var(--font-sans)",
          background: "rgba(255,77,106,0.1)",
          border: "1px solid var(--danger)",
          borderRadius: 6,
          padding: "8px 12px",
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={loading || !email || !password}
        style={{
          background: "var(--accent)",
          border: "none",
          borderRadius: 8,
          padding: "12px",
          color: "#fff",
          fontSize: 14,
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading || !email || !password ? 0.6 : 1,
          marginTop: 4,
        }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </div>
  );
}
