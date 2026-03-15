"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function inviteUser(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;

  if (!email?.trim() || !role) return { error: "Email and role are required" };

  // Check caller is admin
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") return { error: "Not authorised" };

  // Send invite via Supabase Auth
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email.trim(),
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      data: { name: name.trim(), role },
    }
  );

  if (inviteError) {
    console.error("inviteUser:", inviteError.message);
    return { error: inviteError.message };
  }

  // Create user record in our User table
  const { error: dbError } = await supabaseAdmin.from("User").insert({
    id: inviteData.user.id,
    email: email.trim(),
    name: name.trim() || email.trim(),
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (dbError) console.error("inviteUser (db):", dbError.message);

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") return;

  const { error } = await supabaseAdmin
    .from("User")
    .update({ role, updatedAt: new Date().toISOString() })
    .eq("id", userId);

  if (error) console.error("updateUserRole:", error.message);
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") return;

  // Delete from auth
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (authError) console.error("deleteUser (auth):", authError.message);

  // Delete from our User table
  const { error: dbError } = await supabaseAdmin
    .from("User")
    .delete()
    .eq("id", userId);
  if (dbError) console.error("deleteUser (db):", dbError.message);

  revalidatePath("/admin/users");
}
