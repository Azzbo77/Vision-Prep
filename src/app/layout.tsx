import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Vision Prep",
  description: "Visual step-by-step assembly instructions",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let role = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("User")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role ?? null;
    }
  } catch {
    // Not authenticated yet
  }

  return (
    <html lang="en" className="w-full">
      <body className={`${dmSans.variable} ${dmMono.variable} w-full min-h-screen`}>
        <NavBar role={role} />
        <main className="w-full">{children}</main>
      </body>
    </html>
  );
}
