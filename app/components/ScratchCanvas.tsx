"use client";

import { useEffect, useRef } from "react";

interface ScratchCanvasProps {
  onComplete: () => void;
}

export default function ScratchCanvas({ onComplete }: ScratchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const isCompleted = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const buildCanvas = () => {
      if (isCompleted.current) return;

      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      // Draw scratch coating
      ctx.fillStyle = "#C62828";
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw pattern text on top
      ctx.save();
      ctx.translate(rect.width / 2, rect.height / 2);
      ctx.rotate(-Math.PI / 12);
      ctx.fillStyle = "#FFD700";
      ctx.font = `bold ${Math.min(rect.width / 8, 22)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CÀO ĐI NÀO!", 0, -18);
      ctx.font = `${Math.min(rect.width / 10, 18)}px sans-serif`;
      ctx.fillText("🎁 💰 🍀", 0, 18);
      ctx.restore();

      // Set erase mode
      ctx.globalCompositeOperation = "destination-out";
    };

    buildCanvas();

    // Handle resize
    const ro = new ResizeObserver(buildCanvas);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if (e.type.startsWith("touch")) {
      const t =
        (e as React.TouchEvent).touches[0] ??
        (e as React.TouchEvent).changedTouches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const erase = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  };

  const checkDone = () => {
    if (isCompleted.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    // Sample every 16th pixel for performance
    for (let i = 3; i < data.length; i += 4 * 16) {
      if (data[i] < 128) transparent++;
    }
    const pct = transparent / (data.length / (4 * 16));

    if (pct > 0.55) {
      isCompleted.current = true;
      canvas.style.transition = "opacity 0.5s ease-out";
      canvas.style.opacity = "0";
      setTimeout(onComplete, 500);
    }
  };

  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const { x, y } = getPos(e);
    erase(x, y);
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const { x, y } = getPos(e);
    erase(x, y);
    if (Math.random() > 0.7) checkDone();
  };

  const onStop = () => {
    isDrawing.current = false;
    checkDone();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-pointer touch-none"
      onMouseDown={onStart}
      onMouseMove={onMove}
      onMouseUp={onStop}
      onMouseLeave={onStop}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onStop}
    />
  );
}
