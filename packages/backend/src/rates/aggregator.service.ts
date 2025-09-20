import { Injectable, OnModuleInit } from "@nestjs/common";
import type { HourlyAverage, Pair, Tick } from "@app/shared";
import { FinnhubService } from "../ticks/finnhub.service";
import { PersistenceService, PersistedState } from "./persistence.service";

@Injectable()
export class AggregatorService implements OnModuleInit {
  private sums = new Map<string, { sum: number; count: number }>();
  private latest: Record<Pair, HourlyAverage | undefined> = {
    "ETH/USDC": undefined,
    "ETH/USDT": undefined,
    "ETH/BTC": undefined,
  };

  constructor(
    private finnhub: FinnhubService,
    private persistence: PersistenceService
  ) {
    // Subscribe to live ticks and fold them into hourly buckets
    this.finnhub.ticks$().subscribe((t) => this.add(t));
  }

  async onModuleInit() {
    // Load persisted sums if available
    const state = await this.persistence.load();
    if (state?.sums) {
      for (const [key, val] of Object.entries(state.sums)) {
        this.sums.set(key, { sum: val.sum, count: val.count });
      }
      // Rebuild latest from sums
      for (const key of this.sums.keys()) {
        const [pair, hourIso] = key.split("|") as [Pair, string];
        const { sum, count } = this.sums.get(key)!;
        this.latest[pair] = { pair, hourIso, avg: sum / Math.max(1, count) };
      }
    }
    // Periodically flush state to disk
    this.persistence.scheduleAutoFlush(() => this.serialize());
  }

  // Accept ticks and fold into hourly buckets, emitting latest state
  private add(t: Tick) {
    const hourIso = this.floorToHourISO(t.ts);
    const key = `${t.pair}|${hourIso}`;
    const curr = this.sums.get(key) ?? { sum: 0, count: 0 };
    curr.sum += t.price;
    curr.count += 1;
    this.sums.set(key, curr);
    this.latest[t.pair] = { pair: t.pair, hourIso, avg: curr.sum / curr.count };
  }

  getLatest(): Array<HourlyAverage> {
    return Object.values(this.latest).filter(Boolean) as HourlyAverage[];
  }

  private floorToHourISO(ts: number): string {
    const d = new Date(ts);
    d.setMinutes(0, 0, 0);
    return d.toISOString();
  }

  private serialize(): PersistedState {
    const sums: PersistedState["sums"] = {};
    for (const [k, v] of this.sums.entries()) {
      sums[k] = { sum: v.sum, count: v.count };
    }
    return { sums };
  }
}
