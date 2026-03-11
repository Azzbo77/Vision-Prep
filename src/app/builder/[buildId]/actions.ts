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