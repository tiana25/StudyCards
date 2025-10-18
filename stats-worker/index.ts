import { Redis } from 'ioredis';
import Fastify from 'fastify'
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const app = Fastify();

// --- Health endpoint ---
app.get('/health', async () => ({ status: 'ok', service: 'stats-worker' }));

// --- Get aggregate stats for a single card ---
app.get('/stats/cards/:id', async (req: any) => {
  const id = +req.params.id;
  const card = db.prepare('SELECT id, front, back, difficulty FROM cards WHERE id = ?').get(id);
  if (!card) return { error: 'Card not found' };

  const totalReviews = db.prepare('SELECT COUNT(*) as c FROM reviews WHERE card_id = ?').get(id).c;
  const correct = db.prepare('SELECT COUNT(*) as c FROM reviews WHERE card_id = ? AND result = 1').get(id).c;
  const wrong = totalReviews - correct;

  return {
    card_id: id,
    front: card.front,
    back: card.back,
    difficulty: card.difficulty,
    correct,
    wrong,
    totalReviews
  };
});

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
// Resolve a shared cards.db path so this worker opens the same DB the API created.
// Use CARDS_DB_PATH env var to override; otherwise default to ../cards-api/cards.db
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.CARDS_DB_PATH || path.join(__dirname, '..', 'cards-api', 'cards.db');
console.log('Opening SQLite DB at', dbPath);
const db = new Database(dbPath);

// --- Start HTTP server ---
app.listen({ port: 4000, host: '0.0.0.0' })
  .then(() => console.log('Stats-worker REST API running on port 4000'))
  .catch(console.error)

// --- Worker logic ---
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

// async function loop() {
//   while (true) await processBatch();
// }

// loop()