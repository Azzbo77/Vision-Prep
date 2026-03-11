import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ImageUploadForm from "./ImageUploadForm";
import AnnotationCanvas from "./AnnotationCanvas";

export default async function StepPage({
  params,
}: {
  params: Promise<{ folderId: string; stepId: string }>;
}) {
  const { folderId, stepId } = await params;

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
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link
          href={`/library/${folderId}`}
          style={{
            color: "var(--text-muted)",
            fontSize: 13,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
          }}
        >
          ← Back to Folder
        </Link>
        <h1 style={{
          color: "var(--text)",
          fontFamily: "var(--font-sans)",
          fontSize: 22,
          fontWeight: 700,
        }}>
          {step.title}
        </h1>
        {step.description && (
          <p style={{
            color: "var(--text-muted)",
            fontSize: 14,
            marginTop: 8,
            lineHeight: 1.6,
          }}>
            {step.description}
          </p>
        )}
      </div>

      {/* Image upload */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}>
        <h2 style={{
          color: "var(--text)",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 16,
        }}>
          Upload Image
        </h2>
        <ImageUploadForm stepId={stepId} />
      </div>

      {/* Images with annotation */}
      {images && images.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {images.map((image) => (
            <div
              key={image.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <h3 style={{
                color: "var(--text)",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                Annotate Image
              </h3>
              <AnnotationCanvas
                imageId={image.id}
                imageUrl={image.url}
                existingAnnotations={image.annotations as object[] ?? []}
              />
            </div>
          ))}
        </div>
      )}

      {(!images || images.length === 0) && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 40,
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}>
          No images yet — upload one above
        </div>
      )}
    </div>
  );
}