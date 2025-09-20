import { Module } from "@nestjs/common";
import { RatesController } from "./rates/controller";
import { StreamController } from "./stream.controller";
import { RatesService } from "./rates/service";
import { FinnhubService } from "./ticks/finnhub.service";
import { AggregatorService } from "./rates/aggregator.service";
import { PersistenceService } from "./rates/persistence.service";

@Module({
  controllers: [StreamController, RatesController],
  providers: [
    RatesService,
    FinnhubService,
    AggregatorService,
    PersistenceService,
  ],
})
export class AppModule {}
