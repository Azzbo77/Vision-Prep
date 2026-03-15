"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function SetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSetPassword() {
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

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
          New Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
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
          Confirm Password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat password"
          onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
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
        onClick={handleSetPassword}
        disabled={loading || !password || !confirm}
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
          opacity: loading || !password || !confirm ? 0.6 : 1,
          marginTop: 4,
        }}
      >
        {loading ? "Setting password..." : "Set Password & Sign In"}
      </button>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "40px 48px",
        width: "100%",
        maxWidth: 400,
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48,
            height: 48,
            background: "var(--accent)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            margin: "0 auto 16px",
          }}>
            👁
          </div>
          <h1 style={{
            color: "var(--text)",
            fontFamily: "var(--font-mono)",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 8,
          }}>
            Set Your Password
          </h1>
          <p style={{
            color: "var(--text-muted)",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
          }}>
            Choose a password to complete your account setup
          </p>
        </div>
        <Suspense fallback={<div style={{ color: "var(--text-muted)", textAlign: "center" }}>Loading...</div>}>
          <SetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
