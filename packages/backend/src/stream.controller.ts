import { Controller, Get, Sse, MessageEvent } from "@nestjs/common";
import { map, Observable, interval, merge, timer } from "rxjs";
import type { ServerEvent } from "@app/shared";
import { ServerEventType, ConnectionStateEnum } from "@app/shared";
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
  events(): Observable<MessageEvent> {
    const ticks$ = this.finnhub.ticks$().pipe(
      map((t) => ({ data: { type: ServerEventType.TICK, data: t } as ServerEvent }))
    );
    const keepalive$ = timer(0, 3_000).pipe(
      map(() => ({ data: { type: ServerEventType.STATUS, data: { state: ConnectionStateEnum.CONNECTED } } as ServerEvent }))
    );
    return merge(keepalive$, ticks$);
  }
}
