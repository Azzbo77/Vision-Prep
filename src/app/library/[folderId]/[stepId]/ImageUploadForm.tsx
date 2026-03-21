"use client";
import { useRef, useState, useTransition } from "react";
import { uploadStepImage } from "../../actions";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUploadForm({ stepId }: { stepId: string }) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    setPreview(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, WEBP, and GIF files are supported.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (error) return;

    const formData = new FormData(e.currentTarget);
    formData.set("stepId", stepId);

    startTransition(async () => {
      await uploadStepImage(formData);
      setPreview(null);
      setError(null);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <input
          ref={fileRef}
          name="file"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif"
          required
          onChange={handleFileChange}
          style={{
            color: "var(--text-muted)",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
          }}
        />
        <div style={{
          color: "var(--text-dim)",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          marginTop: 4,
        }}>
          JPG, PNG, WEBP or GIF — max {MAX_SIZE_MB}MB
        </div>
      </div>

      {error && (
        <div style={{
          color: "var(--danger)",
          fontSize: 12,
          fontFamily: "var(--font-sans)",
          background: "rgba(255,77,106,0.1)",
          border: "1px solid var(--danger)",
          borderRadius: 6,
          padding: "8px 12px",
        }}>
          {error}
        </div>
      )}

      {preview && (
        <img
          src={preview}
          alt="Preview"
          style={{
            width: "100%",
            maxWidth: 400,
            borderRadius: 8,
            border: "1px solid var(--border)",
          }}
        />
      )}

      <div>
        <button
          type="submit"
          disabled={isPending || !!error || !preview}
          style={{
            background: isPending || !!error || !preview ? "var(--surface-high)" : "var(--accent)",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            color: isPending || !!error || !preview ? "var(--text-muted)" : "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: isPending || !!error || !preview ? "not-allowed" : "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          {isPending ? "Uploading..." : "Upload Image"}
        </button>
      </div>
    </form>
  );
}