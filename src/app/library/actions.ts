"use server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

export async function createFolder(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name?.trim()) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("Folder").insert({
    id: createId(),
    name: name.trim(),
    description: description?.trim() || null,
    updatedAt: new Date().toISOString(),
  });
  if (error) console.error("createFolder:", error.message);
  revalidatePath("/library");
}

export async function deleteFolder(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("Folder").delete().eq("id", id);
  if (error) console.error("deleteFolder:", error.message);
  revalidatePath("/library");
}

export async function createStep(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const folderId = formData.get("folderId") as string;
  if (!title?.trim()) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("Step").insert({
    id: createId(),
    title: title.trim(),
    description: description?.trim() || "",
    folderId: folderId || null,
    updatedAt: new Date().toISOString(),
  });
  if (error) console.error("createStep:", error.message);
  revalidatePath("/library");
}

export async function deleteStep(id: string, folderId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("Step").delete().eq("id", id);
  if (error) console.error("deleteStep:", error.message);
  revalidatePath(`/library/${folderId}`);
}

export async function uploadStepImage(formData: FormData) {
  const file = formData.get("file") as File;
  const stepId = formData.get("stepId") as string;
  if (!file || !stepId) return;
  const supabase = await createSupabaseServerClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${createId()}.${fileExt}`;
  const filePath = `steps/${stepId}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from("step-images")
    .upload(filePath, file);
  if (uploadError) {
    console.error("uploadStepImage (storage):", uploadError.message);
    return;
  }
  const { data: { publicUrl } } = supabase.storage
    .from("step-images")
    .getPublicUrl(filePath);
  const { error: dbError } = await supabase.from("StepImage").insert({
    id: createId(),
    stepId,
    url: publicUrl,
  });
  if (dbError) console.error("uploadStepImage (db):", dbError.message);
  revalidatePath("/library");
}

export async function saveAnnotations(imageId: string, annotations: object[]) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("StepImage")
    .update({ annotations })
    .eq("id", imageId);
  if (error) console.error("saveAnnotations:", error.message);
  revalidatePath("/library");
}