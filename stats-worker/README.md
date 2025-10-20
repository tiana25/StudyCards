# stats-worker

Background worker that consumes review events from a Redis stream and updates card difficulty in a shared SQLite database.

## What it does

- Connects to Redis and reads from the `reviews` stream.
- Aggregates review results per card (correct / wrong).
- Calculates a `diff` (percent wrong) and updates `cards.difficulty` in the shared `cards.db`.

## Environment

- `REDIS_URL` (optional) - Redis connection string. Defaults to `redis://localhost:6379`.
- `CARDS_DB_PATH` (optional) - Absolute path to the `cards.db` file created by the API. Defaults to `../cards-api/cards.db` relative to the worker folder.

## Run

Install dependencies in the `stats-worker` folder and run the worker (example uses npm scripts):

```bash
cd stats-worker
npm install
npm run dev
```

## Notes

- The worker does not expose an HTTP API by default. It's a background process. If you need a health endpoint or metrics, add a small HTTP server.
- Ensure `cards-api` and `stats-worker` point to the same `cards.db` file. Use the `CARDS_DB_PATH` env var if needed when you run them from different working directories.

## Testing

- There's a TODO in the code to add unit tests for aggregation logic (happy path + zero-data path).

## Troubleshooting

- `SqliteError: no such table: cards` — the worker is opening a different `cards.db` file than the API. Set `CARDS_DB_PATH` to the API's DB or run the worker from the project root so it resolves to `../cards-api/cards.db`.
- Redis connection issues — check `REDIS_URL` and that the Redis server is running.

## Future improvements

- Add an HTTP health/metrics endpoint.
- Use XREADGROUP and a consumer group with acknowledgements for reliable processing.
- Add unit tests and CI.

## Kubernetes deployment
After Redis is deployed:
`kubectl exec -it $(kubectl get pods -l app=redis -o jsonpath='{.items[0].metadata.name}') -- \
  redis-cli XGROUP CREATE reviews stats-workers 0 MKSTREAM`