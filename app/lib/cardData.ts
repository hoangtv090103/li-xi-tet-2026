export interface Card {
  id: string;
  amount: number;
  multiplier: number;
  imagePath: string;
}

export interface ClaimedCard extends Card {
  claimed: boolean;
  playerName?: string;
}

export const CARDS: Card[] = [
  { id: 'card-1', amount: 20000, multiplier: 1, imagePath: '/cards/card-1.webp' },
  { id: 'card-2', amount: 10000, multiplier: 5, imagePath: '/cards/card-2.webp' },
  { id: 'card-3', amount: 25000, multiplier: 2, imagePath: '/cards/card-3.webp' },
  { id: 'card-4', amount: 50000, multiplier: 1, imagePath: '/cards/card-4.webp' },
  { id: 'card-5', amount: 20000, multiplier: 5, imagePath: '/cards/card-5.webp' },
];

export function formatCurrency(amount: number): string {
  // 10000 -> "10k"
  if (amount >= 1000) {
    return `${amount / 1000}k`;
  }
  return `${amount}`;
}

export function formatPrizeTotal(amount: number, multiplier: number): string {
  const total = amount * multiplier;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
}
