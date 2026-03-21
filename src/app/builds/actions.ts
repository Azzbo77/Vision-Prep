"use server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

export async function createBuild(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const customerRef = formData.get("customerRef") as string;
  if (!title?.trim()) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("Build").insert({
    id: createId(),
    title: title.trim(),
    description: description?.trim() || null,
    customerRef: customerRef?.trim() || null,
    status: "DRAFT",
    tags: [],
    updatedAt: new Date().toISOString(),
  });
  if (error) console.error("createBuild:", error.message);
  revalidatePath("/builds");
}

export async function deleteBuild(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("Build").delete().eq("id", id);
  if (error) console.error("deleteBuild:", error.message);
  revalidatePath("/builds");
}

export async function addStepToBuild(buildId: string, stepId: string, order: number) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("BuildStep").insert({
    id: createId(),
    buildId,
    stepId,
    order,
  });
  if (error) console.error("addStepToBuild:", error.message);
  revalidatePath(`/builds/${buildId}`);
}

export async function removeStepFromBuild(buildStepId: string, buildId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("BuildStep").delete().eq("id", buildStepId);
  if (error) console.error("removeStepFromBuild:", error.message);
  revalidatePath(`/builds/${buildId}`);
}

export async function updateBuildStatus(buildId: string, status: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("Build")
    .update({ status, updatedAt: new Date().toISOString() })
    .eq("id", buildId);
  if (error) console.error("updateBuildStatus:", error.message);
  revalidatePath(`/builds/${buildId}`);
}

export async function assignBuilder(buildId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("BuildAssignment").insert({
    id: createId(),
    buildId,
    userId,
    assignedAt: new Date().toISOString(),
  });
  if (error) console.error("assignBuilder:", error.message);
  revalidatePath(`/builds/${buildId}/assignments`);
}

export async function unassignBuilder(assignmentId: string, buildId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("BuildAssignment")
    .delete()
    .eq("id", assignmentId);
  if (error) console.error("unassignBuilder:", error.message);
  revalidatePath(`/builds/${buildId}/assignments`);
}
