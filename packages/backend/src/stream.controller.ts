import { Controller, Get, Sse } from "@nestjs/common";
import { map, Observable } from "rxjs";
import type { ServerEvent } from "@app/shared";
import { ServerEventType } from "@app/shared";
import { FinnhubService } from "./ticks/finnhub.service";
import { AggregatorService } from "./rates/aggregator.service";

@Controller()
export class StreamController {
  constructor(
    private finnhub: FinnhubService,
    private agg: AggregatorService
  ) {}
  @Get("health")
  health() {
    return { ok: true, time: new Date().toISOString() };
  }

  @Sse("events")
  events(): Observable<any> {
    return this.finnhub
      .ticks$()
      .pipe(
        map((t) => ({
          // Let Nest serialize the payload; don't pre-stringify or the client will receive a quoted string
          data: { type: ServerEventType.TICK, data: t } as ServerEvent,
        }))
      );
  }
}
