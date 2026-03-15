export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { toggleCritical } from "../../actions";
import ImageUploadForm from "./ImageUploadForm";
import AnnotationCanvas from "./AnnotationCanvas";

export default async function StepPage({
  params,
}: {
  params: Promise<{ folderId: string; stepId: string }>;
}) {
  const { folderId, stepId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: step } = await supabase
    .from("Step")
    .select("*")
    .eq("id", stepId)
    .single();

  const { data: images } = await supabase
    .from("StepImage")
    .select("*")
    .eq("stepId", stepId)
    .order("createdAt", { ascending: true });

  if (!step) {
    return (
      <div style={{ padding: 32, color: "var(--text-muted)" }}>
        Step not found
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <Link href={`/library/${folderId}`} style={{
          color: "var(--text-muted)",
          fontSize: 13,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
        }}>
          ← Back to Folder
        </Link>
        <h1 style={{
          color: "var(--text)",
          fontFamily: "var(--font-sans)",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 4,
        }}>
          {step.title}
        </h1>
        {step.description && (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {step.description}
          </p>
        )}

        {/* Critical toggle */}
        <form action={toggleCritical.bind(null, step.id, folderId)}>
          <input type="hidden" name="critical" value={step.critical ? "false" : "true"} />
          <button type="submit" style={{
            background: step.critical ? "rgba(255,77,106,0.1)" : "var(--surface)",
            border: `1px solid ${step.critical ? "var(--danger)" : "var(--border)"}`,
            borderRadius: 8,
            padding: "8px 16px",
            color: step.critical ? "var(--danger)" : "var(--text-muted)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            {step.critical ? "⚠ Critical Step — Click to Remove" : "Mark as Critical Step"}
          </button>
        </form>
      </div>

      <ImageUploadForm stepId={stepId} />

      <div style={{ marginTop: 32 }}>
        {images?.map((image) => (
          <div key={image.id} style={{ marginBottom: 24 }}>
            <AnnotationCanvas
              imageId={image.id}
              imageUrl={image.url}
              existingAnnotations={image.annotations ?? []}
            />
          </div>
        ))}
        {(!images || images.length === 0) && (
          <div style={{
            color: "var(--text-muted)",
            fontSize: 13,
            textAlign: "center",
            padding: "48px 0",
            background: "var(--surface)",
            borderRadius: 12,
            border: "1px solid var(--border)",
          }}>
            No images yet — upload one above
          </div>
        )}
      </div>
    </div>
  );
}