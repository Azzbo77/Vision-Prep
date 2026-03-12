"use server";

import { supabase } from "@/lib/supabase";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function getCurrentUserId(): Promise<string> {
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  return user?.id ?? "poc-user";
}

export async function completeStep(buildStepId: string, buildId: string) {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from("StepCompletion").insert({
    id: createId(),
    buildStepId,
    userId,
    completedAt: new Date().toISOString(),
  });
  if (error) console.error("completeStep:", error.message);
  revalidatePath(`/builder/${buildId}`);
}

export async function uncompleteStep(buildStepId: string, buildId: string) {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("StepCompletion")
    .delete()
    .eq("buildStepId", buildStepId)
    .eq("userId", userId);
  if (error) console.error("uncompleteStep:", error.message);
  revalidatePath(`/builder/${buildId}`);
}

export async function reportIssue(
  buildStepId: string,
  buildId: string,
  type: string,
  description: string
) {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from("IssueReport").insert({
    id: createId(),
    buildStepId,
    reporterId: userId,
    type,
    status: "OPEN",
    description,
    imageUrls: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  if (error) console.error("reportIssue:", error.message);
  revalidatePath(`/builder/${buildId}`);
}
