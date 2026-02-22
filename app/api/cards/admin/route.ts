import { NextRequest, NextResponse } from 'next/server';
import { CARDS } from '@/app/lib/cardData';
import { readClaims, resetClaims, removeClaim } from '@/app/lib/csvStorage';

export async function GET() {
  try {
    const claims = await readClaims();

    const adminCards = CARDS.map((card) => {
      const claim = claims.find((c) => c.cardId === card.id);
      return {
        ...card,
        claimed: !!claim,
        playerName: claim?.playerName,
        claimedAt: claim?.claimedAt,
      };
    });

    return NextResponse.json({ cards: adminCards });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin cards' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await resetClaims();
    return NextResponse.json({ success: true, message: 'All claims reset' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset claims' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { cardId, unclaim } = await req.json();

    if (unclaim && cardId) {
      await removeClaim(cardId);
      return NextResponse.json({ success: true, message: `Removed claim for ${cardId}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to modify claim' }, { status: 500 });
  }
}
