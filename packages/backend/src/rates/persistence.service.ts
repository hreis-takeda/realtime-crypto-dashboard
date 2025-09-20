import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { promises as fs } from "fs";
import path from "path";

type HourKey = string; // `${pair}|${hourIso}`

export type PersistedState = {
  sums: Record<HourKey, { sum: number; count: number }>;
};

@Injectable()
export class PersistenceService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(PersistenceService.name);
  private readonly filePath = path.resolve(
    process.cwd(),
    "packages/backend/data/hourly-averages.json"
  );
  private flushTimer: NodeJS.Timeout | null = null;

  async onModuleInit() {
    await this.ensureDir();
  }

  async onModuleDestroy() {
    if (this.flushTimer) clearInterval(this.flushTimer);
  }

  scheduleAutoFlush(fn: () => PersistedState, everyMs = 10_000) {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(async () => {
      try {
        await this.save(fn());
      } catch (e) {
        this.logger.warn(`Auto-flush failed: ${String(e)}`);
      }
    }, everyMs);
  }

  async load(): Promise<PersistedState | undefined> {
    try {
      const buf = await fs.readFile(this.filePath);
      return JSON.parse(buf.toString()) as PersistedState;
    } catch (e: any) {
      if (e?.code === "ENOENT") return undefined;
      this.logger.warn(`Failed to load persisted state: ${String(e)}`);
      return undefined;
    }
  }

  async save(state: PersistedState): Promise<void> {
    try {
      await this.ensureDir();
      const tmp = this.filePath + ".tmp";
      await fs.writeFile(tmp, JSON.stringify(state));
      await fs.rename(tmp, this.filePath);
    } catch (e) {
      this.logger.warn(`Failed to save persisted state: ${String(e)}`);
    }
  }

  private async ensureDir() {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
  }
}
