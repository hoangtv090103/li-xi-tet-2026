import { NextResponse } from 'next/server';
import { CARDS, ClaimedCard } from '@/app/lib/cardData';
import { readClaims } from '@/app/lib/csvStorage';

export async function GET() {
  try {
    const claims = await readClaims();

    const cardsWithStatus: ClaimedCard[] = CARDS.map((card) => {
      const claim = claims.find((c) => c.cardId === card.id);
      return {
        ...card,
        claimed: !!claim,
        playerName: claim ? claim.playerName : undefined,
      };
    });

    const safeResponse = cardsWithStatus.map(card => {
      if (card.claimed) {
        return card; // Claimed cards expose amount/multiplier (already public)
      }
      return {
        id: card.id,
        imagePath: card.imagePath,
        claimed: false,
        // Don't send amount/multiplier to prevent cheating
      };
    });

    return NextResponse.json({ cards: safeResponse });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}
