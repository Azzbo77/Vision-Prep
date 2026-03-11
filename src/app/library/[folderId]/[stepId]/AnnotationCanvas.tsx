"use client";

import { useEffect, useRef, useState } from "react";
import { saveAnnotations } from "../../actions";

type Tool = "select" | "circle" | "arrow" | "text";

interface Props {
    imageId: string;
    imageUrl: string;
    existingAnnotations?: object[];
}

export default function AnnotationCanvas({
    imageId,
    imageUrl,
    existingAnnotations = [],
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<any>(null);
    const [activeTool, setActiveTool] = useState<Tool>("select");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const activeToolRef = useRef<Tool>("select");

    useEffect(() => {
        activeToolRef.current = activeTool;
    }, [activeTool]);

    useEffect(() => {
        let fabricCanvas: any = null;

        async function init() {
            const fabric = await import("fabric");
            const F = (fabric as any).default ?? fabric;

            fabricCanvas = new F.Canvas(canvasRef.current, {
                width: 700,
                height: 420,
                backgroundColor: "#1C2130",
            });
            fabricRef.current = fabricCanvas;

            // Load background image
            const imgElement = new Image();
            imgElement.crossOrigin = "anonymous";
            imgElement.onload = () => {
                const img = new F.Image(imgElement);
                const scale = Math.min(700 / imgElement.width, 420 / imgElement.height);
                const left = (700 - imgElement.width * scale) / 2;
                const top = (420 - imgElement.height * scale) / 2;
                img.set({
                    left,
                    top,
                    scaleX: scale,
                    scaleY: scale,
                    selectable: false,
                    evented: false,
                    originX: "left",
                    originY: "top",
                });
                fabricCanvas.add(img);

                if (existingAnnotations?.length > 0) {
                  existingAnnotations.forEach((obj: any) => {
                    let fabricObj;
                    if (obj.type === "Circle") {
                      fabricObj = new F.Circle(obj);
                    } else if (obj.type === "Line") {
                      fabricObj = new F.Line([obj.x1, obj.y1, obj.x2, obj.y2], obj);
                    } else if (obj.type === "IText") {
                      fabricObj = new F.IText(obj.text || "", obj);
                    }
                    if (fabricObj) {
                      fabricCanvas.add(fabricObj);
                    }
                  });
                  fabricCanvas.renderAll();
                }

                fabricCanvas.renderAll();
            };
            imgElement.src = imageUrl;

            // Handle click to add shapes
            fabricCanvas.on("mouse:down", (opt: any) => {
    const tool = activeToolRef.current;
    if (tool === "select") return;
    const pointer = fabricCanvas.getScenePoint(opt.e);

    if (tool === "circle") {
        const circle = new F.Circle({
            left: pointer.x - 30,
            top: pointer.y - 30,
            radius: 30,
            fill: "transparent",
            stroke: "#4F7FFF",
            strokeWidth: 3,
        });
        fabricCanvas.add(circle);
        fabricCanvas.setActiveObject(circle);
    }

    if (tool === "arrow") {
        const arrow = new F.Line(
            [pointer.x, pointer.y, pointer.x + 80, pointer.y + 80],
            {
                stroke: "#FF4D6A",
                strokeWidth: 3,
                selectable: true,
            }
        );
        fabricCanvas.add(arrow);
        fabricCanvas.setActiveObject(arrow);
    }

    if (tool === "text") {
        const text = new F.IText("Label", {
            left: pointer.x,
            top: pointer.y,
            fontSize: 18,
            fill: "#F5A623",
            fontFamily: "sans-serif",
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        text.enterEditing();
    }

        fabricCanvas.renderAll();
        setActiveTool("select");
      });
    }

    init();

    return () => {
      if (fabricCanvas) fabricCanvas.dispose();
    };
  }, [imageUrl]);

async function handleSave() {
    if (!fabricRef.current) return;
    setSaving(true);

    const objects = fabricRef.current.getObjects();
    // Skip the background image (first object)
    const annotations = objects.slice(1).map((obj: any) => obj.toObject());

    await saveAnnotations(imageId, annotations);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
}

function handleDelete() {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active) {
        fabricRef.current.remove(active);
        fabricRef.current.renderAll();
    }
}

const tools: { id: Tool; label: string; color: string }[] = [
    { id: "select", label: "✦ Select", color: "var(--text-muted)" },
    { id: "circle", label: "◯ Circle", color: "#4F7FFF" },
    { id: "arrow", label: "→ Arrow", color: "#FF4D6A" },
    { id: "text", label: "T Text", color: "#F5A623" },
];

return (
    <div>
        {/* Toolbar */}
        <div style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
            flexWrap: "wrap",
            alignItems: "center",
        }}>
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    style={{
                        background: activeTool === tool.id ? `${tool.color}22` : "var(--surface-high)",
                        border: `1px solid ${activeTool === tool.id ? tool.color : "var(--border)"}`,
                        borderRadius: 7,
                        padding: "6px 14px",
                        color: activeTool === tool.id ? tool.color : "var(--text-muted)",
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                    }}
                >
                    {tool.label}
                </button>
            ))}
            <button
                onClick={handleDelete}
                style={{
                    background: "var(--surface-high)",
                    border: "1px solid var(--border)",
                    borderRadius: 7,
                    padding: "6px 14px",
                    color: "var(--danger)",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    cursor: "pointer",
                    marginLeft: 4,
                }}
            >
                ✕ Delete
            </button>
            <button
                onClick={handleSave}
                disabled={saving}
                style={{
                    background: saved ? "var(--success)" : "var(--accent)",
                    border: "none",
                    borderRadius: 7,
                    padding: "6px 18px",
                    color: "#fff",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    marginLeft: "auto",
                    transition: "background 0.2s",
                }}
            >
                {saving ? "Saving..." : saved ? "✓ Saved" : "Save Annotations"}
            </button>
        </div>

        {/* Canvas */}
        <div style={{
            border: "1px solid var(--border)",
            borderRadius: 10,
            overflow: "hidden",
            display: "inline-block",
        }}>
            <canvas ref={canvasRef} />
        </div>

        <p style={{
            color: "var(--text-dim)",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            marginTop: 8,
        }}>
            Click a tool then click the canvas to place it. Click Select to move objects.
        </p>
    </div>
);
}