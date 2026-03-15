"use client";

import { useRef, useState } from "react";
import { inviteUser } from "../actions";

export function InviteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await inviteUser(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      formRef.current?.reset();
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <input
        name="name"
        placeholder="Full name"
        required
        disabled={loading}
        style={{
          flex: 1,
          minWidth: 160,
          background: "var(--surface-high)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 14px",
          color: "var(--text)",
          fontSize: 13,
          fontFamily: "var(--font-sans)",
          outline: "none",
          opacity: loading ? 0.6 : 1,
        }}
      />
      <input
        name="email"
        type="email"
        placeholder="Email address"
        required
        disabled={loading}
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
          opacity: loading ? 0.6 : 1,
        }}
      />
      <select
        name="role"
        required
        disabled={loading}
        style={{
          background: "var(--surface-high)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 14px",
          color: "var(--text)",
          fontSize: 13,
          fontFamily: "var(--font-sans)",
          outline: "none",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <option value="BUILDER">Builder</option>
        <option value="SUPERVISOR">Supervisor</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        type="submit"
        disabled={loading}
        style={{
          background: "var(--accent)",
          border: "none",
          borderRadius: 8,
          padding: "10px 20px",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-sans)",
          whiteSpace: "nowrap",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Sending..." : "Send Invite"}
      </button>

      {error && (
        <div style={{
          width: "100%",
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

      {success && (
        <div style={{
          width: "100%",
          color: "var(--success)",
          fontSize: 12,
          fontFamily: "var(--font-sans)",
          background: "rgba(34,197,94,0.1)",
          border: "1px solid var(--success)",
          borderRadius: 6,
          padding: "8px 12px",
        }}>
          Invite sent successfully!
        </div>
      )}
    </form>
  );
}
