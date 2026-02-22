import fs from 'fs';
import path from 'path';

const CSV_FILE_PATH = path.join(process.cwd(), 'data', 'cards.csv');

interface ClaimRecord {
  cardId: string;
  playerName: string;
  claimedAt: string;
}

// Ensure the CSV file exists with headers
function ensureFileExists() {
  if (!fs.existsSync(CSV_FILE_PATH)) {
    const dir = path.dirname(CSV_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CSV_FILE_PATH, 'cardId,playerName,claimedAt\n', 'utf8');
  }
}

export function readClaims(): ClaimRecord[] {
  ensureFileExists();
  const content = fs.readFileSync(CSV_FILE_PATH, 'utf8');
  const lines = content.split('\n').filter((line) => line.trim() !== '');

  // Skip header, parse rows
  return lines.slice(1).map((line) => {
    // Basic CSV parsing
    const parts = line.split(',');
    return {
      cardId: parts[0]?.trim() || '',
      playerName: parts[1]?.trim() || '',
      claimedAt: parts[2]?.trim() || '',
    };
  }).filter(record => record.cardId !== '');
}

export function writeClaim(cardId: string, playerName: string): void {
  ensureFileExists();
  
  // Escape commas in playerName just in case
  const safeName = playerName.replace(/,/g, ' ');
  const claimedAt = new Date().toISOString();
  
  const line = `${cardId},${safeName},${claimedAt}\n`;
  fs.appendFileSync(CSV_FILE_PATH, line, 'utf8');
}

export function isCardClaimed(cardId: string): boolean {
  const claims = readClaims();
  return claims.some((claim) => claim.cardId === cardId);
}

export function resetClaims(): void {
  ensureFileExists();
  fs.writeFileSync(CSV_FILE_PATH, 'cardId,playerName,claimedAt\n', 'utf8');
}

export function removeClaim(cardId: string): void {
  ensureFileExists();
  const claims = readClaims();
  const filtered = claims.filter(c => c.cardId !== cardId);
  
  let newContent = 'cardId,playerName,claimedAt\n';
  filtered.forEach(c => {
    newContent += `${c.cardId},${c.playerName},${c.claimedAt}\n`;
  });
  fs.writeFileSync(CSV_FILE_PATH, newContent, 'utf8');
}
