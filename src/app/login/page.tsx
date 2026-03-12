export const dynamic = "force-dynamic";

import LoginForm from "./LoginForm";

export default function LoginPage() {
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
            VISION PREP
          </h1>
          <p style={{
            color: "var(--text-muted)",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
          }}>
            Sign in to your account
          </p>
        </div>
        <LoginForm />
      </div>
      {/* Test accounts */}
      <div style={{
        marginTop: 24,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "24px 32px",
        width: "100%",
        maxWidth: 400,
      }}>
        <div style={{
          color: "var(--text-muted)",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 16,
        }}>
          Test Accounts
        </div>
        {[
          { role: "Admin", email: "testadmin@test.com", password: "changeme123", color: "#A78BFA" },
          { role: "Supervisor", email: "testsupervisor@test.com", password: "changeme456", color: "var(--accent)" },
          { role: "Builder", email: "testbuilder@test.com", password: "changeme789", color: "var(--success)" },
        ].map((account) => (
          <div key={account.role} style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
            padding: "10px 12px",
            background: "var(--surface-high)",
            borderRadius: 8,
            border: "1px solid var(--border)",
          }}>
            <span style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: account.color,
              width: 80,
              flexShrink: 0,
            }}>
              {account.role}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 12,
                color: "var(--text)",
                fontFamily: "var(--font-mono)",
              }}>
                {account.email}
              </div>
              <div style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}>
                {account.password}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
