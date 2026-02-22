import { NextRequest, NextResponse } from 'next/server';
import { CARDS } from '@/app/lib/cardData';
import { isCardClaimed, writeClaim } from '@/app/lib/csvStorage';

export async function POST(req: NextRequest) {
  try {
    const { cardId, playerName } = await req.json();

    if (!cardId || !playerName) {
      return NextResponse.json({ error: 'Missing cardId or playerName' }, { status: 400 });
    }

    const card = CARDS.find((c) => c.id === cardId);
    if (!card) {
      return NextResponse.json({ error: 'Invalid card ID' }, { status: 404 });
    }

    if (isCardClaimed(cardId)) {
      return NextResponse.json({ error: 'Thẻ này đã bị người khác chọn mất rồi!' }, { status: 409 });
    }

    // Write to CSV
    writeClaim(cardId, playerName);

    // Return the full card info (amounts, etc) now that it's successfully claimed
    return NextResponse.json({ success: true, card });
  } catch (error) {
    console.error('Error claiming card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
