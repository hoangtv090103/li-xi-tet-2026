"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ClaimedCard } from "@/app/lib/cardData";
import CardPopup from "./CardPopup";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CardCircle({
  cards,
  playerName,
}: {
  cards: ClaimedCard[];
  playerName: string;
}) {
  const [selectedCard, setSelectedCard] = useState<ClaimedCard | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<ClaimedCard[]>(cards);

  useEffect(() => {
    setShuffledCards(shuffle(cards));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalCards = shuffledCards.length;
  const totalArc = 140;

  const handleCardClick = (card: ClaimedCard) => {
    if (!card.claimed) {
      // Normal flow: claim and scratch
      setViewOnly(false);
      setSelectedCard(card);
    } else if (card.playerName === playerName) {
      // Own claimed card: allow view only
      setViewOnly(true);
      setSelectedCard(card);
    }
    // Else: someone else's card — do nothing (no alert, just unclickable)
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="relative flex items-end justify-center"
        style={{ width: "100%", height: "75vw", maxHeight: "380px" }}
      >
        {shuffledCards.map((card, index) => {
          const angleDeg =
            totalCards > 1
              ? -totalArc / 2 + (index / (totalCards - 1)) * totalArc
              : 0;

          const midIndex = (totalCards - 1) / 2;
          const distFromMid = Math.abs(index - midIndex);
          const liftY = -distFromMid * 14;

          const isOwnCard = card.claimed && card.playerName === playerName;
          const isSomeoneElse = card.claimed && card.playerName !== playerName;

          return (
            <div
              key={card.id}
              className="absolute group"
              style={{
                transformOrigin: "bottom center",
                transform: `rotate(${angleDeg}deg) translateY(${liftY}px)`,
                zIndex: index,
                bottom: 0,
                cursor: isOwnCard
                  ? "pointer"
                  : isSomeoneElse
                    ? "default"
                    : "pointer",
              }}
              onClick={() => handleCardClick(card)}
            >
              <div
                className={`relative rounded-xl overflow-hidden shadow-xl transition-all duration-200 border-[3px]
                  ${
                    isSomeoneElse
                      ? "opacity-50 grayscale border-gray-400 cursor-not-allowed"
                      : isOwnCard
                        ? "border-green-400 group-active:scale-110 group-active:-translate-y-4 group-active:z-50"
                        : "border-yellow-400 group-active:scale-110 group-active:-translate-y-4 group-active:z-50"
                  }`}
                style={{
                  width: "clamp(80px, 28vw, 130px)",
                  height: "clamp(120px, 42vw, 195px)",
                }}
              >
                <Image
                  src={card.imagePath}
                  alt="Lì Xì"
                  fill
                  className="object-cover"
                  priority
                  sizes="130px"
                />

                {/* Own card indicator + name at bottom */}
                {isOwnCard && (
                  <div className="absolute inset-0 flex flex-col">
                    {/* Name ribbon at top */}
                    <div className="bg-red-600/90 text-white text-[9px] font-bold text-center py-0.5 px-1 truncate max-w-full">
                      {card.playerName}
                    </div>
                    {/* "Tap to view" at bottom */}
                    <div className="flex-1 flex items-end justify-center pb-1.5">
                      <span className="text-white text-[9px] font-semibold bg-green-700/80 px-1.5 py-0.5 rounded">
                        Của bạn 👆
                      </span>
                    </div>
                  </div>
                )}

                {/* Greyed overlay for someone else's card */}
                {isSomeoneElse && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col">
                    {/* Name ribbon at top */}
                    <div className="bg-gray-700/90 text-white text-[9px] font-bold text-center py-0.5 px-1 truncate max-w-full">
                      {card.playerName}
                    </div>
                    {/* Đã bốc label centered */}
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-white font-bold text-xs bg-gray-700/90 px-2 py-1 rounded shadow text-center">
                        Đã bốc
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <span className="bg-white/60 backdrop-blur-sm text-red-700 text-sm font-bold px-4 py-1.5 rounded-full shadow">
          👆 Chạm vào thẻ để bốc
        </span>
      </div>

      {selectedCard && (
        <CardPopup
          card={selectedCard}
          playerName={playerName}
          viewOnly={viewOnly}
          onClose={() => {
            setSelectedCard(null);
            setViewOnly(false);
          }}
        />
      )}
    </div>
  );
}
