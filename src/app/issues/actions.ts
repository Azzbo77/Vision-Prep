"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function acknowledgeIssue(issueId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("IssueReport")
    .update({
      status: "ACKNOWLEDGED",
      updatedAt: new Date().toISOString(),
    })
    .eq("id", issueId);
  if (error) console.error("acknowledgeIssue:", error.message);
  revalidatePath("/");
}

export async function resolveIssue(issueId: string, adminNotes: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("IssueReport")
    .update({
      status: "RESOLVED",
      adminNotes,
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .eq("id", issueId);
  if (error) console.error("resolveIssue:", error.message);
  revalidatePath("/");
}
