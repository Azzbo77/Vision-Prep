"use client";

import { useEffect, useRef } from "react";

interface Props {
  imageUrl: string;
  annotations: object[];
}

export default function AnnotationViewer({ imageUrl, annotations }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let fabricCanvas: any = null;

    async function init() {
      const fabric = await import("fabric");
      const F = (fabric as any).default ?? fabric;

      const width = containerRef.current?.offsetWidth || 600;
      const height = Math.round(width * 0.56);

      fabricCanvas = new F.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: "#1C2130",
        selection: false,
      });

      const imgElement = new Image();
      imgElement.crossOrigin = "anonymous";
      imgElement.onload = async () => {
        const img = new F.Image(imgElement);
        const scale = Math.min(width / imgElement.width, height / imgElement.height);
        const left = (width - imgElement.width * scale) / 2;
        const top = (height - imgElement.height * scale) / 2;
        img.set({
          left, top, scaleX: scale, scaleY: scale,
          selectable: false, evented: false,
          originX: "left", originY: "top",
        });
        fabricCanvas.add(img);

        if (annotations?.length > 0) {
          annotations.forEach((obj: any) => {
            let fabricObj;
            if (obj.type === "Circle") fabricObj = new F.Circle({ ...obj, selectable: false, evented: false });
            else if (obj.type === "Line") fabricObj = new F.Line([obj.x1, obj.y1, obj.x2, obj.y2], { ...obj, selectable: false, evented: false });
            else if (obj.type === "IText") fabricObj = new F.IText(obj.text || "", { ...obj, selectable: false, evented: false });
            if (fabricObj) fabricCanvas.add(fabricObj);
          });
        }

        fabricCanvas.renderAll();
      };
      imgElement.src = imageUrl;
    }

    init();
    return () => { if (fabricCanvas) fabricCanvas.dispose(); };
  }, [imageUrl, annotations]);

  return (
    <div ref={containerRef} style={{ width: "100%", marginBottom: 16 }}>
      <div style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
        display: "block",
      }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </div>
    </div>
  );
}