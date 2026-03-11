"use server";

import { supabase } from "@/lib/supabase";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";

export async function completeStep(buildStepId: string, buildId: string) {
  await supabase.from("StepCompletion").insert({
    id: createId(),
    buildStepId,
    userId: "poc-user",
    completedAt: new Date().toISOString(),
  });

  revalidatePath(`/builder/${buildId}`);
}

export async function uncompleteStep(buildStepId: string, buildId: string) {
  await supabase
    .from("StepCompletion")
    .delete()
    .eq("buildStepId", buildStepId)
    .eq("userId", "poc-user");

  revalidatePath(`/builder/${buildId}`);
}

export async function reportIssue(
  buildStepId: string,
  buildId: string,
  type: string,
  description: string
) {
  const { error } = await supabase.from("IssueReport").insert({
    id: createId(),
    buildStepId,
    reporterId: "poc-user",
    type,
    status: "OPEN",
    description,
    imageUrls: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath(`/builder/${buildId}`);
}