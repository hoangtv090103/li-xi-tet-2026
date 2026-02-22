import { NextResponse } from 'next/server';
import { CARDS, ClaimedCard } from '@/app/lib/cardData';
import { readClaims } from '@/app/lib/csvStorage';

export async function GET() {
  try {
    const claims = readClaims();
    
    // Map hardcoded cards with their claim status
    const cardsWithStatus: ClaimedCard[] = CARDS.map((card) => {
      const claim = claims.find((c) => c.cardId === card.id);
      return {
        ...card,
        claimed: !!claim,
        playerName: claim ? claim.playerName : undefined,
      };
    });

    // Provide safe version to clients (without amount and multiplier if not claimed?)
    // Actually, in a real app, we shouldn't send amounts for unclaimed cards,
    // but building this simple app, we send them to the frontend to handle, 
    // or maybe we just hide them to prevent cheating.
    // Let's hide amount/multiplier for unclaimed so people don't cheat via DevTools.
    const safeResponse = cardsWithStatus.map(card => {
      if (card.claimed) {
        return card; // Already claimed, it's public knowledge who got what
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
