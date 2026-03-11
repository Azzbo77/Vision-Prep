"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

export async function createFolder(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name?.trim()) return;

  await supabase.from("Folder").insert({
    id: createId(),
    name: name.trim(),
    description: description?.trim() || null,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/library");
}

export async function deleteFolder(id: string) {
  await supabase.from("Folder").delete().eq("id", id);
  revalidatePath("/library");
}
export async function createStep(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const folderId = formData.get("folderId") as string;

  if (!title?.trim()) return;

  await supabase.from("Step").insert({
    id: createId(),
    title: title.trim(),
    description: description?.trim() || "",
    folderId: folderId || null,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/library");
}

export async function deleteStep(id: string, folderId: string) {
  await supabase.from("Step").delete().eq("id", id);
  revalidatePath(`/library/${folderId}`);
}

export async function uploadStepImage(formData: FormData) {
  const file = formData.get("file") as File;
  const stepId = formData.get("stepId") as string;

  if (!file || !stepId) {
    return;
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${createId()}.${fileExt}`;
  const filePath = `steps/${stepId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("step-images")
    .upload(filePath, file);

  if (uploadError) return;

  const { data: { publicUrl } } = supabase.storage
    .from("step-images")
    .getPublicUrl(filePath);

  const { error: dbError } = await supabase.from("StepImage").insert({
    id: createId(),
    stepId,
    url: publicUrl,
  });

  revalidatePath("/library");
}