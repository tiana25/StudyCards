import Fastify from 'fastify';
import { Redis } from 'ioredis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const app = Fastify();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const db = new Database('cards.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS cards(id INTEGER PRIMARY KEY, front TEXT, back TEXT, difficulty REAL DEFAULT 0)
`).run();
db.prepare(`
  CREATE TABLE IF NOT EXISTS reviews(id INTEGER PRIMARY KEY, card_id INTEGER, result INTEGER, reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP)
`).run();

app.post('/cards', async (req: any) => {
    const { front, back } = req.body;
    db.prepare('INSERT INTO cards(front, back) VALUES (?, ?)').run(front, back);
    return { status: 'ok', message: 'Card was added'}
})

app.get('/cards/next', async () => {
    const cards = db.prepare('SELECT * FROM cards ORDER BY difficulty ASC LIMIT 5').all();
    return { cards };
})

app.post('/cards/:id/review', async (req: any) => {
    const { remembered } = req.body;
    console.log('remembered', remembered)
    const cardId = +req.params.id;
    db.prepare('INSERT INTO reviews(card_id, result) VALUES (?, ?)').run(cardId, remembered ? 1 : 0);
    return { ok: true };
})

app.listen({ port: 3000, host: '0.0.0.0' });