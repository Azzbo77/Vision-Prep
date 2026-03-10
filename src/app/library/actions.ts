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