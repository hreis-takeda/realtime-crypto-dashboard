import { Controller, Get } from "@nestjs/common";
import { AggregatorService } from "./aggregator.service";

@Controller("rates")
export class RatesController {
  constructor(private readonly agg: AggregatorService) {}

  @Get("hourly")
  latestHourly() {
    return this.agg.getLatest();
  }
}
