"use client";

import { useState } from "react";
import Image from "next/image";
import { ClaimedCard } from "@/app/lib/cardData";
import ScratchCanvas from "./ScratchCanvas";
import CelebrationOverlay from "./CelebrationOverlay";

function getRandomCorner() {
  const positions = [
    { top: "8px", left: "8px" },
    { top: "8px", right: "8px" },
    { bottom: "8px", left: "8px" },
    { bottom: "8px", right: "8px" },
  ];
  return positions[Math.floor(Math.random() * positions.length)];
}

interface CardPopupProps {
  card: ClaimedCard;
  playerName: string;
  onClose: () => void;
  viewOnly?: boolean; // true = show result directly without claim flow
}

export default function CardPopup({
  card,
  playerName,
  onClose,
  viewOnly = false,
}: CardPopupProps) {
  // In view-only mode, start already flipped, no scratch overlay
  const [isFlipped, setIsFlipped] = useState(viewOnly);
  const [claimedData, setClaimedData] = useState<ClaimedCard | null>(
    viewOnly ? card : null,
  );
  const [showScratch, setShowScratch] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [multiplierCorner] = useState(() => getRandomCorner());

  // Step 1: User hits "Lật thẻ"
  const handleFlip = async () => {
    if (isClaiming) return;
    setIsClaiming(true);

    try {
      // "Peek" the real value of the card from the server, but DO NOT claim it in the DB yet!
      // This allows others to claim it if we back out, but gives us the info to render under the scratch canvas.
      const res = await fetch("/api/cards/peek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Có lỗi xảy ra!");
        onClose();
        return;
      }

      setClaimedData(data.card); // Save the peeked data

      // Now flip instantly with the scratch layer ready
      setShowScratch(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsFlipped(true);
        });
      });
    } catch {
      alert("Không thể kết nối. Vui lòng thử lại!");
    } finally {
      setIsClaiming(false);
    }
  };

  // Step 2: User finishes scratching (>55% revealed)
  const handleScratchComplete = async () => {
    setIsClaiming(true);
    try {
      // Actually claim the card and write the name to the DB!
      const res = await fetch("/api/cards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, playerName }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Thẻ này đã bị giành mất rồi!");
        onClose();
        return;
      }

      setClaimedData(data.card);
      setIsCelebration(true);
    } catch {
      alert("Không thể kết nối. Vui lòng thử lại!");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {isCelebration && claimedData && (
        <CelebrationOverlay
          card={claimedData}
          onClose={() => {
            setIsCelebration(false);
            onClose();
            window.location.reload();
          }}
        />
      )}

      {!isCelebration && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white text-4xl hover:text-yellow-400 transition-colors z-50 drop-shadow"
        >
          &times;
        </button>
      )}

      <div className="relative w-[300px] h-[450px] perspective-1000">
        <div
          className={`w-full h-full transition-transform duration-700 transform-style-3d relative ${isFlipped ? "rotate-y-180" : ""}`}
        >
          {/* ===== FRONT FACE ===== */}
          <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden border-4 border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.3)] bg-red-900">
            <Image
              src={card.imagePath}
              alt="Mặt trước"
              fill
              className="object-cover"
            />
            {!viewOnly && (
              <div className="absolute bottom-6 left-0 w-full flex justify-center">
                <button
                  onClick={handleFlip}
                  disabled={isClaiming}
                  className="bg-yellow-400 hover:bg-yellow-300 text-red-900 font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 border-2 border-yellow-200"
                >
                  {isClaiming ? "Đang mở..." : "Lật Thẻ 🔄"}
                </button>
              </div>
            )}
          </div>

          {/* ===== BACK FACE ===== */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-4 border-yellow-400 bg-red-800 shadow-[0_0_40px_rgba(255,100,0,0.4)] overflow-hidden flex flex-col items-center justify-center p-6">
            <div className="relative w-full flex-1 flex items-center justify-center">
              {/* If we already fetched the data or are in viewOnly mode */}
              {claimedData && (
                <>
                  <span className="text-6xl font-extrabold text-yellow-300 drop-shadow-lg z-10 select-none">
                    {claimedData.amount >= 1000
                      ? `${claimedData.amount / 1000}k`
                      : claimedData.amount}
                  </span>

                  {claimedData.multiplier > 1 && (
                    <span
                      className="absolute text-3xl font-extrabold text-white opacity-90 drop-shadow-lg z-10 select-none"
                      style={multiplierCorner}
                    >
                      x{claimedData.multiplier}
                    </span>
                  )}
                </>
              )}

              {/* Loader during API calls (either flip or claim phase) */}
              {isClaiming && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 rounded-xl">
                  <span className="text-xl text-yellow-300 font-bold animate-pulse">
                    Đang nạp lộc...
                  </span>
                </div>
              )}

              {/* Scratch layer — only shown until scratching is perfectly done and API returns */}
              {showScratch && !viewOnly && (
                <div className="absolute inset-0 z-20 rounded-lg overflow-hidden">
                  <ScratchCanvas onComplete={handleScratchComplete} />
                </div>
              )}

              {/* View-only: prize already revealed, show total */}
              {viewOnly && claimedData && (
                <div className="absolute bottom-0 left-0 right-0 text-center pb-2">
                  <span className="text-sm text-yellow-200/70 font-semibold">
                    Thực nhận:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(claimedData.amount * claimedData.multiplier)}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center pb-2 text-yellow-200/60 text-xs">
              {viewOnly
                ? "🌸 Kết quả của bạn"
                : "Chúc bạn An Khang Thịnh Vượng!"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
