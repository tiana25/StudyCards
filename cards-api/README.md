### Description

A REST API with the following requests:

- POST `/cards` - adds cards (JSON or CSV text)
- GET `/cards/next?limit=5` - return lowest-difficulty cards (random if empty)
- POST `/cards/:id/review` - `{ "remembered": true|false }`
  - writes raw review to DB
  - also pushes an event to Redis Stream `reviews`:
    ```
    { "card_id": 123, "remembered": true, "ts": "2025-10-13T10:01:02Z" }
    ```
