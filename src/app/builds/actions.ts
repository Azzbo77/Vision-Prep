"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

export async function createBuild(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title?.trim()) return;

  await supabase.from("Build").insert({
    id: createId(),
    title: title.trim(),
    description: description?.trim() || null,
    status: "DRAFT",
    tags: [],
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/builds");
}

export async function deleteBuild(id: string) {
  await supabase.from("Build").delete().eq("id", id);
  revalidatePath("/builds");
}

export async function addStepToBuild(buildId: string, stepId: string, order: number) {
  await supabase.from("BuildStep").insert({
    id: createId(),
    buildId,
    stepId,
    order,
  });

  revalidatePath(`/builds/${buildId}`);
}

export async function removeStepFromBuild(buildStepId: string, buildId: string) {
  await supabase.from("BuildStep").delete().eq("id", buildStepId);
  revalidatePath(`/builds/${buildId}`);
}

export async function updateBuildStatus(buildId: string, status: string) {
  await supabase
    .from("Build")
    .update({ status, updatedAt: new Date().toISOString() })
    .eq("id", buildId);

  revalidatePath(`/builds/${buildId}`);
}
