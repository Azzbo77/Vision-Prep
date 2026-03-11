"use client";

import { useRef, useState, useTransition } from "react";
import { uploadStepImage } from "../../actions";

export default function ImageUploadForm({ stepId }: { stepId: string }) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("stepId", stepId);
    startTransition(async () => {
      await uploadStepImage(formData);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        ref={fileRef}
        name="file"
        type="file"
        accept="image/*"
        required
        onChange={handleFileChange}
        style={{
          color: "var(--text-muted)",
          fontSize: 13,
          fontFamily: "var(--font-sans)",
        }}
      />
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
          disabled={isPending}
          style={{
            background: isPending ? "var(--surface-high)" : "var(--accent)",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            color: isPending ? "var(--text-muted)" : "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: isPending ? "not-allowed" : "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          {isPending ? "Uploading..." : "Upload Image"}
        </button>
      </div>
    </form>
  );
}