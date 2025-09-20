import { Injectable } from "@nestjs/common";
import type { HourlyAverage } from "@app/shared";

@Injectable()
export class RatesService {
  private latest: Record<string, HourlyAverage | undefined> = {};

  upsert(avg: HourlyAverage) {
    this.latest[`${avg.pair}:${avg.hourIso}`] = avg;
  }

  getLatestHourly() {
    return Object.values(this.latest).filter(Boolean);
  }
}
