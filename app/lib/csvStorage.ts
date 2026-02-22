/**
 * Supabase-backed storage replacing the original CSV file approach.
 * Table: card_claims (card_id TEXT PK, player_name TEXT, claimed_at TIMESTAMPTZ)
 */
import { getSupabase } from './supabaseClient';

export interface CardClaim {
  cardId: string;
  playerName: string;
  claimedAt: string;
}

export async function readClaims(): Promise<CardClaim[]> {
  const { data, error } = await getSupabase()
    .from('card_claims')
    .select('*')
    .order('claimed_at', { ascending: true });

  if (error) {
    console.error('[readClaims] Supabase error:', error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, string>) => ({
    cardId: row.card_id,
    playerName: row.player_name,
    claimedAt: row.claimed_at,
  }));
}

export async function isCardClaimed(cardId: string): Promise<boolean> {
  const { count, error } = await getSupabase()
    .from('card_claims')
    .select('*', { count: 'exact', head: true })
    .eq('card_id', cardId);

  if (error) {
    console.error('[isCardClaimed] Supabase error:', error.message);
    return false;
  }

  return (count ?? 0) > 0;
}

export async function writeClaim(cardId: string, playerName: string): Promise<void> {
  const { error } = await getSupabase().from('card_claims').insert({
    card_id: cardId,
    player_name: playerName,
    claimed_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[writeClaim] Supabase error:', error.message);
    throw new Error(error.message);
  }
}

export async function resetClaims(): Promise<void> {
  const { error } = await getSupabase()
    .from('card_claims')
    .delete()
    .neq('card_id', ''); // delete all rows

  if (error) {
    console.error('[resetClaims] Supabase error:', error.message);
    throw new Error(error.message);
  }
}

export async function removeClaim(cardId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('card_claims')
    .delete()
    .eq('card_id', cardId);

  if (error) {
    console.error('[removeClaim] Supabase error:', error.message);
    throw new Error(error.message);
  }
}
