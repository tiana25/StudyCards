import { Redis } from 'ioredis';
import Fastify from 'fastify'
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

// --- Setup Redis + DB ---
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
// Resolve a shared cards.db path so this worker opens the same DB the API created.
// Use CARDS_DB_PATH env var to override; otherwise default to ../cards-api/cards.db
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.CARDS_DB_PATH || path.join(__dirname, '..', 'data', 'cards.db');
console.log('Opening SQLite DB at', dbPath);
const db = new Database(dbPath);

// --- HTTP API ---
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

app.post('/stats/trigger', async () => {
  await processBatch(); // Reuse the same function below
  return { ok: true, message: 'Manual aggregation completed' };
});

// --- Start HTTP server ---
app.listen({ port: 4000, host: '0.0.0.0' })
  .then(() => console.log('Stats-worker REST API running on port 4000'))
  .catch(console.error)

const STREAM_NAME = 'reviews';
const GROUP_NAME = 'stats-workers';
const WORKER_ID = process.env.WORKER_ID || 'worker-1';

async function handleEntries(res: any) {
  if (!res || !Array.isArray(res[0])) return;
  const [_, entries] = res[0];
  if (!entries || entries.length === 0) return;

  // collect message IDs to ack after successful DB updates
  const toAcknowledge: string[] = [];
  // set of card IDs touched in this batch
  const touched = new Set<number>();

  for (const [msgId, fields] of entries) {
    // example entry: [ '1760992343237-0', [ 'card_id', '2', 'remembered', '0' ]
    // fields example: [ 'card_id', '2', 'remembered', '0' ]
    const cardId = Number(fields[1]);
    touched.add(cardId);
    toAcknowledge.push(msgId);
  }

  // For each touched card, compute totals from DB
  for (const cardId of touched) {
    //card with <card_id> has been reviewed <total> times and correctly answered <correct_sum>.
    const totalRow = db.prepare(
      'SELECT COUNT(*) as total, SUM(result) as correct_sum FROM reviews WHERE card_id = ?'
    ).get(cardId);

    const total = totalRow?.total || 0;
    const correct = totalRow?.correct_sum || 0;

    if (total === 0) {
      // no reviews yet — skip update
      continue;
    }

    const difficulty = 100 * (1 - correct / total);

    // update DB
    try {
      db.prepare('UPDATE cards SET difficulty = ? WHERE id = ?').run(difficulty, cardId);
    } catch (err) {
      console.error('DB update failed for card', cardId, err);
      // If DB update fails, messages are not acknowledged, then they should be reprocessed later
      return;
    }
  }

  // All DB updates succeeded — acknowledge all message ids
  for (const id of toAcknowledge) {
    try {
      await redis.xack(STREAM_NAME, GROUP_NAME, id);
    } catch (err) {
      console.error('Failed to xack', id, err);
    }
  }
}

async function processBatch() {
  // unread message fron the consumer group
  const res = await redis.xreadgroup(
    'GROUP', GROUP_NAME, WORKER_ID,
    'COUNT', 10,
    'BLOCK', 5000,
    'STREAMS', STREAM_NAME, '>'
  );
  if (!res) return;
  await handleEntries(res);
}

async function loop() {
  while (true) {
    try {
      await processBatch();
    } catch (err) {
      console.error('Worker loop error:', err);
      await new Promise(r => setTimeout(r, 1000)); // wait on error
    }
  }
}

loop()