import { Injectable, OnModuleInit } from "@nestjs/common";
import WebSocket from "ws";
import { Subject, Observable, interval, map, merge } from "rxjs";
import type { Pair, Tick } from "@app/shared";

type ExchangeSymbol = "BINANCE:ETHUSDC" | "BINANCE:ETHUSDT" | "BINANCE:ETHBTC";

const PAIR_TO_SYMBOL: Record<Pair, ExchangeSymbol> = {
  "ETH/USDC": "BINANCE:ETHUSDC",
  "ETH/USDT": "BINANCE:ETHUSDT",
  "ETH/BTC": "BINANCE:ETHBTC",
};

const SYMBOL_TO_PAIR: Record<ExchangeSymbol, Pair> = {
  "BINANCE:ETHUSDC": "ETH/USDC",
  "BINANCE:ETHUSDT": "ETH/USDT",
  "BINANCE:ETHBTC": "ETH/BTC",
};

@Injectable()
export class FinnhubService implements OnModuleInit {
  private ws: WebSocket | null = null;
  private backoffMs = 1000;
  private readonly maxBackoffMs = 30_000;
  private readonly subject = new Subject<Tick>();
  private started = false;

  public ticks$(): Observable<Tick> {
    return this.subject.asObservable();
  }

  onModuleInit() {
    // Start connection when the module initializes
    if (!this.started) {
      this.started = true;
      const token = process.env.FINNHUB_API_KEY;
      if (!token) {
        // Fallback to mock ticks to keep the app usable without a key
        this.startMockStream();
      } else {
        this.connect(token);
      }
    }
  }

  private startMockStream() {
    const pairs: Tick["pair"][] = ["ETH/USDC", "ETH/USDT", "ETH/BTC"];
    const streams = pairs.map((pair, i) =>
      interval(1000 + i * 200).pipe(
        map((n) => ({
          pair,
          price: 1000 + Math.random() * 100 + n * 0.2,
          ts: Date.now(),
        }))
      )
    );
    merge(...streams).subscribe((t) => this.subject.next(t));
  }

  private connect(token: string) {
    try {
      const url = `wss://ws.finnhub.io?token=${encodeURIComponent(token)}`;
      this.ws = new WebSocket(url);

      this.ws.on("open", () => {
        this.backoffMs = 1000;
        // Subscribe to desired symbols
        (Object.values(PAIR_TO_SYMBOL) as ExchangeSymbol[]).forEach((sym) => {
          this.ws?.send(JSON.stringify({ type: "subscribe", symbol: sym }));
        });
      });

      this.ws.on("message", (buf) => {
        try {
          const msg = JSON.parse(String(buf));
          if (msg.type === "trade" && Array.isArray(msg.data)) {
            for (const d of msg.data) {
              const pair = SYMBOL_TO_PAIR[d.s as ExchangeSymbol];
              if (!pair) continue;
              const t: Tick = { pair, price: Number(d.p), ts: Number(d.t) };
              this.subject.next(t);
            }
          }
        } catch {
          // ignore parse errors
        }
      });

      const scheduleReconnect = () => {
        this.ws?.removeAllListeners();
        this.ws = null;
        const delay = this.backoffMs;
        this.backoffMs = Math.min(this.backoffMs * 2, this.maxBackoffMs);
        setTimeout(() => this.connect(token), delay);
      };

      this.ws.on("close", scheduleReconnect);
      this.ws.on("error", scheduleReconnect);
    } catch {
      // If immediate failure, try again with backoff
      const delay = this.backoffMs;
      this.backoffMs = Math.min(this.backoffMs * 2, this.maxBackoffMs);
      setTimeout(() => this.connect(token), delay);
    }
  }
}
