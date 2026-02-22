import { NextRequest, NextResponse } from 'next/server';
import { resetClaims, removeClaim, readClaims } from '@/app/lib/csvStorage';
import { CARDS } from '@/app/lib/cardData';

export async function GET() {
  try {
    // Admin route to just get raw data including unmasked amounts
    const claims = readClaims();
    const cardsWithStatus = CARDS.map((card) => {
      const claim = claims.find((c) => c.cardId === card.id);
      return {
        ...card,
        claimed: !!claim,
        playerName: claim ? claim.playerName : undefined,
        claimedAt: claim ? claim.claimedAt : undefined,
      };
    });

    return NextResponse.json({ cards: cardsWithStatus });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    resetClaims();
    return NextResponse.json({ success: true, message: 'All claims reset' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset claims' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { cardId, unclaim } = await req.json();
    
    if (unclaim && cardId) {
      removeClaim(cardId);
      return NextResponse.json({ success: true, message: `Removed claim for ${cardId}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to modify claim' }, { status: 500 });
  }
}
