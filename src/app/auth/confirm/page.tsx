"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ConfirmPage() {
  const [status, setStatus] = useState("Confirming your account...");
  const router = useRouter();

  useEffect(() => {
    async function processHash() {
      const hash = window.location.hash.substring(1);
      if (!hash) {
        setStatus("Something went wrong. Please ask an admin to resend your invite.");
        return;
      }

      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const type = params.get("type");

      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          setStatus("Something went wrong. Please ask an admin to resend your invite.");
          return;
        }

        if (data.session) {
          if (type === "invite") {
            router.push("/auth/set-password");
          } else {
            router.push("/");
          }
        }
      } else {
        setStatus("Something went wrong. Please ask an admin to resend your invite.");
      }
    }

    processHash();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        color: "var(--text-muted)",
        fontSize: 13,
        fontFamily: "var(--font-sans)",
        textAlign: "center",
        maxWidth: 300,
      }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>👁</div>
        {status}
      </div>
    </div>
  );
}
