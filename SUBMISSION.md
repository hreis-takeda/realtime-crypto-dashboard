# Submission Packet

This repo contains a real-time crypto dashboard:
- Backend: NestJS + TypeScript (SSE stream + hourly averages persisted to JSON)
- Frontend: React (Vite) + Recharts
- Data source: Finnhub WS (mock fallback if no API key)

## How to run

- Prereqs: Node 18+, pnpm (Corepack).
- Setup:
  - Copy envs: `cp .env.example .env`
  - Add `FINNHUB_API_KEY=...` (optional; mock data used if omitted)
  - Install: `pnpm install`
- Dev: `pnpm dev`
  - Backend: http://localhost:4000 (GET /health, /events, /rates/hourly)
  - Frontend: http://localhost:5173 (or next free port)

## Architecture in 30 seconds

- FinnhubService → normalizes trades to ticks with retry/backoff
- AggregatorService → folds ticks into hourly buckets; exposes latest averages
- PersistenceService → snapshots sums to JSON and restores on startup
- StreamController → SSE `/events` for ticks
- RatesController → REST `/rates/hourly`
- Frontend hooks → `useLivePrices` (SSE) + `useHourlyAverages` (poll)

## Notes

- Graceful when backend is down: UI shows states and retries.
- Easy to flip to WebSockets if desired.

## PR blurb (paste into GitHub)

Title: Real-time Crypto Dashboard (Nest + React, SSE, persisted hourly averages)

Summary:
- Streams ETH/USDC, ETH/USDT, ETH/BTC via SSE from a Nest backend that ingests Finnhub WS
- Frontend shows live charts, last update, and 1h averages; connection state handled
- Hourly averages are persisted to JSON so data survives restarts

How to run:
1) `cp .env.example .env` and add `FINNHUB_API_KEY=...` (optional)
2) `pnpm install`
3) `pnpm dev` → visit the frontend URL in the terminal output

What I’d improve with more time:
- Add unit tests (aggregator and hooks)
- SQLite persistence and range queries for history
- WS transport and a status pill component