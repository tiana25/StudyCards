# cards-api

HTTP API for managing study cards and publishing review events to a Redis stream.

## What it does

- Stores cards in a local SQLite database (`cards.db`).
- Provides endpoints to create cards, fetch the next cards to review, and record review results.
- Pushes review events into a Redis stream named `reviews` so background workers (e.g., `stats-worker`) can process them asynchronously.

## Environment

- `REDIS_URL` (optional) - Redis connection string. Defaults to `redis://localhost:6379`.
- `PORT` (optional) - HTTP port to listen on. Defaults to `3000`.

## Run locally

Install dependencies and start the server in the `cards-api` directory:

```bash
cd cards-api
npm install
npm run dev
```

## Endpoints

POST /cards

- Create a new card.
- Body: { "front": string, "back": string }
- Response: { status: 'ok', message: 'Card was added' }

GET /cards/next

- Returns next cards ordered by `difficulty` ascending (lowest difficulty first). Returns up to 5 cards by default.
- Optional query param `limit` to change how many are returned.
- Response: { cards: [ ... ] }

POST /cards/:id/review

- Record a review for the card and push an event to Redis stream `reviews`.
- Body: { "remembered": boolean | string }
  - Note: the endpoint accepts boolean or string; the worker expects '1' or '0' in the stream.
- Response: { ok: true }

Example (curl):

```bash
curl -X POST http://localhost:3000/cards -H 'Content-Type: application/json' -d '{"front":"Q?","back":"A."}'

curl -X GET http://localhost:3000/cards/next

curl -X POST http://localhost:3000/cards/2/review -H 'Content-Type: application/json' -d '{"remembered": true}'
```

## Redis stream schema

- Stream name: `reviews`
- Entry fields:
  - `card_id`: string (card id)
  - `remembered`: '1' or '0' (string)

The API writes entries with a server-generated ID (`'*'`). Consumers should parse fields as strings and map `'1'` → remembered.

## Next improvements (optional)

- Validate request bodies (e.g., using a schema) to avoid string/bool confusion.
- Publish a JSON payload field in the stream (single field `payload`) to simplify consumer parsing.
- Add tests for endpoints and stream writes.
