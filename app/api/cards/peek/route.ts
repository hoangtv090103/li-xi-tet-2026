import { NextRequest, NextResponse } from 'next/server';
import { CARDS } from '@/app/lib/cardData';
import { isCardClaimed } from '@/app/lib/csvStorage';

/**
 * Returns the full card details (amount, multiplier) WITHOUT claiming it in the database.
 * This allows the frontend to render the prize underneath the scratch card.
 */
export async function POST(req: NextRequest) {
  try {
    const { cardId } = await req.json();

    if (!cardId) {
      return NextResponse.json({ error: 'Thiếu cardId' }, { status: 400 });
    }

    const card = CARDS.find((c) => c.id === cardId);
    if (!card) {
      return NextResponse.json({ error: 'Thẻ không tồn tại' }, { status: 404 });
    }

    // Check if another player has already claimed it
    const alreadyClaimed = await isCardClaimed(cardId);
    if (alreadyClaimed) {
      return NextResponse.json({ error: 'Thẻ này đã bị người khác chọn mất rồi!' }, { status: 409 });
    }

    return NextResponse.json({ success: true, card });
  } catch (error) {
    console.error('Error peeking card:', error);
    return NextResponse.json({ error: 'Failed to peek card' }, { status: 500 });
  }
}
