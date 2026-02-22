"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên của bạn nhé!");
      return;
    }
    if (name.trim().length > 30) {
      setError("Tên dài quá, nhập ngắn gọn thôi!");
      return;
    }
    router.push(`/cards?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm bg-white/70 backdrop-blur-md rounded-3xl border border-red-200 shadow-2xl p-8 text-center">
        <h1
          className="text-5xl text-red-700 drop-shadow mb-1 font-bold"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          Cào Thẻ Tết
        </h1>
        <div className="text-3xl mb-2">🐴</div>
        <h2 className="text-base font-bold text-red-600 tracking-widest mb-8">
          BÍNH NGỌ 2026
        </h2>

        <div className="h-px bg-red-300/60 mb-6" />

        <p className="text-red-800 font-semibold text-base mb-5">
          Nhập tên để nhận lì xì lấy lộc!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            autoComplete="off"
            autoFocus
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Tên của bạn..."
            className="w-full px-5 py-4 text-xl rounded-2xl bg-white text-gray-900 font-semibold border-2 border-red-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400/30 placeholder-gray-400 shadow-inner"
            maxLength={30}
          />

          {error && (
            <p className="text-red-600 font-semibold text-sm animate-pulse">
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xl py-4 rounded-2xl shadow-lg border-2 border-red-800 active:scale-95 transition-transform"
          >
            Vào Bốc Thẻ 🧧
          </button>
        </form>
      </div>

      <p className="mt-6 text-red-900/60 text-xs text-center font-medium">
        Chúc mừng năm mới • An Khang Thịnh Vượng 🌸
      </p>
    </main>
  );
}
