import { Redis } from 'ioredis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const db = new Database('cards.db');

async function processBatch() {
  const res = await redis.xread('COUNT', 10, 'BLOCK', 5000, 'STREAMS', 'reviews', '0');
  if (!res) return;
  const stream = res[0];
  if (!stream) return;
  const [_, entries] = stream;
  const updates = new Map<number, { correct: number; wrong: number; }>();

  for (const [_, fields] of entries) {
    const cardId = Number(fields[1]);
    const remembered = fields[3] === "1";
    const stat = updates.get(cardId) || { correct: 0, wrong: 0 };
    remembered ? stat.correct++ : stat.wrong++;
    updates.set(cardId, stat)
  }

  // TODO: add unit tests for aggregation logic (happy path + zero-data path)
  for (const [id, s] of updates) {
    const total = s.correct + s.wrong;
    // If there are no reviews, skip updating difficulty so the existing value is preserved.
    if (total === 0) continue;
    const diff = 100 * (1 - s.correct / total);
    db.prepare('UPDATE cards SET difficulty = ? WHERE id = ?').run(diff, id);
  }
}

async function loop() {
  await processBatch();
}

loop()