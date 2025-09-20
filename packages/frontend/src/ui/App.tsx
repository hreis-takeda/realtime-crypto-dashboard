import React from "react";
import type { Pair } from "@app/shared";
import { ConnectionStateEnum } from "@app/shared";
import { PriceCard } from "./components/PriceCard";
import { trackedPairs } from "../constants/pairs";
import { useLivePrices } from "../hooks/useLivePrices";
import { useHourlyAverages } from "../hooks/useHourlyAverages";

export function App() {
  const { connectionState, series: priceSeries } = useLivePrices(trackedPairs);
  const hourlyAverages = useHourlyAverages(trackedPairs);

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Dashboard</h1>
      <p
        style={{
          textAlign: "center",
          color:
            connectionState === ConnectionStateEnum.CONNECTED
              ? "green"
              : connectionState === ConnectionStateEnum.CONNECTING
              ? "orange"
              : "red",
        }}
      >
        {connectionState}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
  {trackedPairs.map((pair: Pair) => (
          <PriceCard
            key={pair}
            pairLabel={pair}
            points={priceSeries[pair]}
            hourlyAverage={hourlyAverages[pair]}
          />
        ))}
      </div>
    </div>
  );
}
