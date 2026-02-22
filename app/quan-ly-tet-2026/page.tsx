"use client";

import { useState, useEffect } from "react";
import { ClaimedCard, formatPrizeTotal } from "@/app/lib/cardData";

export default function AdminPage() {
  const [cards, setCards] = useState<ClaimedCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cards/admin");
      const data = await res.json();
      if (data.cards) setCards(data.cards);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleResetAll = async () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn reset toàn bộ dữ liệu? Mọi người sẽ bốc lại từ đầu!",
      )
    )
      return;

    try {
      const res = await fetch("/api/cards/admin", { method: "DELETE" });
      if (res.ok) fetchCards();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnclaim = async (cardId: string) => {
    if (!confirm(`Hủy kết quả của thẻ ${cardId}?`)) return;

    try {
      const res = await fetch("/api/cards/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, unclaim: true }),
      });
      if (res.ok) fetchCards();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin: Quản Lý Thẻ Cào Tết</h1>
        <button
          onClick={handleResetAll}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-colors"
        >
          Reset Tất Cả
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="p-3">Card ID</th>
              <th className="p-3">Mệnh Giá</th>
              <th className="p-3">Hệ Số</th>
              <th className="p-3">Thực Nhận</th>
              <th className="p-3">Trạng Thái</th>
              <th className="p-3">Người Bốc</th>
              <th className="p-3 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr
                key={card.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-3 px-4 font-mono text-sm">{card.id}</td>
                <td className="p-3">{card.amount.toLocaleString("vi-VN")}đ</td>
                <td className="p-3">x{card.multiplier}</td>
                <td className="p-3 font-semibold text-green-600">
                  {formatPrizeTotal(card.amount, card.multiplier)}
                </td>
                <td className="p-3">
                  {card.claimed ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                      Đã bốc
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      Chưa bốc
                    </span>
                  )}
                </td>
                <td className="p-3 font-medium">{card.playerName || "-"}</td>
                <td className="p-3 text-right">
                  {card.claimed && (
                    <button
                      onClick={() => handleUnclaim(card.id)}
                      className="text-sm text-red-500 hover:text-red-700 underline"
                    >
                      Hủy bốc
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
