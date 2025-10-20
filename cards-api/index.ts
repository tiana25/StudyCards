import Fastify from 'fastify';
import { Redis } from 'ioredis';
import { createRequire } from 'module';
import cors from '@fastify/cors'
import path from 'path';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
})
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// --- Resolve DB path (mounted PVC) ---
const dbPath = process.env.CARDS_DB_PATH || path.join(__dirname, '..', 'data', 'cards.db');
console.log('Using SQLite DB at', dbPath);
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS cards(id INTEGER PRIMARY KEY, front TEXT, back TEXT, difficulty REAL DEFAULT 0)
`).run();
db.prepare(`
  CREATE TABLE IF NOT EXISTS reviews(id INTEGER PRIMARY KEY, card_id INTEGER, result INTEGER, reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP)
`).run();

app.post('/cards', async (req: any) => {
  const { front, back, cards } = req.body;
  let added = 0;
  if (Array.isArray(cards)) {
    const stmt = db.prepare('INSERT INTO cards(front, back) VALUES (?, ?)');
    for (const card of cards) {
      if (card.front && card.back) {
        stmt.run(card.front, card.back);
        added++;
      }
    }
    return { status: 'ok', message: `Added ${added} cards`, added };
  } else if (front && back) {
    db.prepare('INSERT INTO cards(front, back) VALUES (?, ?)').run(front, back);
    added = 1;
    return { status: 'ok', message: 'Card was added', added };
  } else {
    return { status: 'error', message: 'Missing card data' };
  }
})

app.get('/cards/next', async () => {
  const cards = db.prepare('SELECT * FROM cards ORDER BY difficulty ASC LIMIT 5').all();
  return { cards };
})

app.post('/cards/:id/review', async (req: any) => {
  const { remembered } = req.body;
  const cardId = +req.params.id;
  db.prepare('INSERT INTO reviews(card_id, result) VALUES (?, ?)').run(cardId, remembered ? 1 : 0);
  // Append a new entry to the Redis stream `reviews` with a server-generated ID ('*').
  // Fields: 'card_id' (string) and 'remembered' ('1' or '0' as strings).
  await redis.xadd('reviews', '*', 'card_id', String(cardId), 'remembered', remembered ? '1' : '0');
  return { ok: true };
})

// --- Start HTTP server ---
app.listen({ port: 3000, host: '0.0.0.0' })
  .then(() => console.log('Cards-api REST API running on port 3000'))
  .catch(console.error)