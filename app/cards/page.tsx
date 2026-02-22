"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CardCircle from "@/app/components/CardCircle";
import { ClaimedCard } from "@/app/lib/cardData";

function CardsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name");

  const [cards, setCards] = useState<ClaimedCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) {
      router.replace("/");
      return;
    }
    fetch("/api/cards")
      .then((r) => r.json())
      .then((d) => {
        if (d.cards) setCards(d.cards);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [name, router]);

  if (loading || !name) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="text-2xl font-bold text-red-700 animate-pulse drop-shadow">
          Đang tải thẻ lộc...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col overflow-hidden">
      {/* Header with semi-transparent white pill */}
      <div className="flex-none pt-8 pb-4 px-4 text-center">
        <div className="inline-block bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl shadow">
          <h1
            className="text-3xl text-red-700 font-bold"
            style={{ fontFamily: "var(--font-dancing-script)" }}
          >
            Chào {name}!
          </h1>
          <p className="text-sm text-red-600 font-semibold mt-0.5">
            Chọn một bao lì xì để xem lộc đầu năm 🎋
          </p>
        </div>
      </div>

      {/* Card fan — takes remaining space */}
      <div className="flex-1 relative min-h-0">
        <CardCircle cards={cards} playerName={name} />
      </div>
    </main>
  );
}

export default function CardsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center text-red-700 text-xl font-bold animate-pulse">
          Đang tải...
        </div>
      }
    >
      <CardsPageContent />
    </Suspense>
  );
}
