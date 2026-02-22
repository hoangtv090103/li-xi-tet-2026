"use client";

import { useEffect, useRef } from "react";
import { ClaimedCard, formatPrizeTotal } from "@/app/lib/cardData";

export default function CelebrationOverlay({
  card,
  onClose,
}: {
  card: ClaimedCard;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Auto resize
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: any[] = [];
    const colors = ["#FFD700", "#FF8C00", "#FF0000", "#FFFFFF"];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * w, // start anywhere on x
        y: Math.random() * h - h, // start above the screen
        r: Math.random() * 4 + 2, // radius
        d: Math.random() * 150, // density
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleInc: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
      });
    }

    let animationId: number;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      angle += 0.01;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(angle + p.d) + 1 + p.r / 2) / 2;
        p.x += Math.sin(angle);

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();

        // If particle drops below screen, respawn at top
        if (p.y > h) {
          p.x = Math.random() * w;
          p.y = -20;
          p.tilt = Math.floor(Math.random() * 10) - 10;
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="relative z-10 bg-linear-to-b from-red-600 to-red-800 p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-yellow-400 text-center text-white max-w-sm w-full animate-bounce-short">
        <div className="text-6xl mb-4">🎉</div>
        <h2
          className="text-3xl font-bold text-yellow-300 drop-shadow mb-6"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          Chúc Mừng Năm Mới!
        </h2>

        <p className="text-lg font-medium mb-2">Bạn đã cào được lộc:</p>
        <div className="text-4xl md:text-5xl font-extrabold text-yellow-400 bg-black/30 py-4 px-6 rounded-xl inline-block shadow-inner mb-8">
          {formatPrizeTotal(card.amount, card.multiplier)}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-red-900 font-bold py-3 rounded-full shadow-lg transition transform hover:scale-105"
        >
          Nhận Lộc & Đóng
        </button>
      </div>
    </div>
  );
}
