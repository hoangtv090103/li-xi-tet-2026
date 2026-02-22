import { NextRequest, NextResponse } from 'next/server';
import { CARDS } from '@/app/lib/cardData';
import { isCardClaimed, writeClaim } from '@/app/lib/csvStorage';

export async function POST(req: NextRequest) {
  try {
    const { cardId, playerName } = await req.json();

    if (!cardId || !playerName) {
      return NextResponse.json({ error: 'Thiếu cardId hoặc playerName' }, { status: 400 });
    }

    const card = CARDS.find((c) => c.id === cardId);
    if (!card) {
      return NextResponse.json({ error: 'Thẻ không tồn tại' }, { status: 404 });
    }

    // Check if already claimed (race-condition safe via Supabase PRIMARY KEY constraint)
    const alreadyClaimed = await isCardClaimed(cardId);
    if (alreadyClaimed) {
      return NextResponse.json({ error: 'Thẻ này đã bị người khác chọn mất rồi!' }, { status: 409 });
    }

    await writeClaim(cardId, playerName);

    return NextResponse.json({ success: true, card });
  } catch (error) {
    console.error('Error claiming card:', error);
    return NextResponse.json({ error: 'Failed to claim card' }, { status: 500 });
  }
}
