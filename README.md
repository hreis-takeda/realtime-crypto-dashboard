# Realtime Crypto Dashboard

Live ETH pairs with streaming ticks and hourly averages. Clean, pragmatic, and easy to reason about.

- Backend: NestJS + TypeScript
- Transport: Server-Sent Events (SSE)
- Frontend: React (Vite) + Recharts
- Ingest: Finnhub WebSocket (falls back to mock without a key)
- Monorepo: pnpm workspaces
- Persistence: JSON file (hourly sums) persisted under `packages/backend/data/`

## Setup

1. Node >= 18.18, Corepack enabled (pnpm provided automatically)
2. Copy envs: `cp .env.example .env`
   - Optional: add `FINNHUB_API_KEY=...` for real data
3. Install deps: `pnpm install`

## Develop

- Run everything: `pnpm dev`
- Frontend: http://localhost:5173 (will pick another free port if busy)
- Backend: http://localhost:4000
  - Health: `GET /health`
  - SSE stream: `GET /events`
  - Hourly averages: `GET /rates/hourly`

Without FINNHUB_API_KEY, the backend emits realistic mock ticks so the UI works offline. With a key, it streams real Binance trades via Finnhub.

## Build

- `pnpm build` builds all packages

See also: `SUBMISSION.md` for a short reviewer-oriented summary and a PR-ready blurb.

## Architecture

- Shared package defines domain types and enums used by both backend and frontend.
- Backend:
  - FinnhubService connects to Finnhub's WS, normalizes trades to ticks, and retries with backoff.
  - AggregatorService folds ticks into per-hour buckets and keeps the latest hourly averages per pair.
  - PersistenceService snapshots the sums/counters to a JSON file and restores them on startup.
  - StreamController exposes an SSE endpoint `/events` for real-time ticks.
  - RatesController exposes `/rates/hourly` for current hourly averages.
- Frontend:
  - Hooks `useLivePrices` (SSE) and `useHourlyAverages` (polling) provide data to components.
  - `PriceCard` renders an Area+Line chart with a deduplicated tooltip, last update, and 1h average.

## Notes

- Hourly averages are computed from per-hour sums and counts and are persisted to `packages/backend/data/hourly-averages.json` periodically. On restart, the backend loads previous state.
- Easy to swap SSE → WebSocket later.

## Submission checklist

- [x] Backend connects to Finnhub WS (with reconnection/backoff) or uses a mock stream when no key is provided
- [x] SSE endpoint `/events` streams ticks to the frontend
- [x] REST endpoint `/rates/hourly` returns current hourly averages
- [x] Frontend renders three live charts (ETH/USDC, ETH/USDT, ETH/BTC), shows last update and 1h average
- [x] Connection state shown and handled gracefully; backend unavailability handled in UI
- [x] Clear setup instructions (env, install, run) and API key guidance
- [x] Code organized with shared types/enums across packages
