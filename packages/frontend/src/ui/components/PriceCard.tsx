import React from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type PricePoint = { ts: number; price: number };

type Props = {
  pairLabel: string;
  points: PricePoint[];
  hourlyAverage?: number;
};

export function PriceCard({ pairLabel, points, hourlyAverage }: Props) {
  const lastPoint = points[points.length - 1];
  const [baseAsset, quoteAsset] = pairLabel.split("/");

  const formatUtc = (ts: number) => {
    const d = new Date(ts);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm} UTC`;
  };

  const decimals = quoteAsset === "BTC" ? 5 : 2;
  const fmt = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
      }}
    >
      <h3 style={{ margin: 0 }}>
        {baseAsset} → {quoteAsset}
      </h3>
      <div style={{ width: "100%", height: 180, marginTop: 8 }}>
        <ResponsiveContainer>
          <ComposedChart
            data={points}
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          >
            <Area
              type="monotone"
              dataKey="price"
              fill="#eceff1"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#111"
              dot={false}
              strokeWidth={2}
            />
            <XAxis
              dataKey="ts"
              tickFormatter={(t) => new Date(t).toLocaleTimeString()}
              hide
            />
            <YAxis domain={["auto", "auto"]} hide />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const price = Number(payload[0].value);
                return (
                  <div
                    className="recharts-default-tooltip"
                    style={{
                      background: "#fff",
                      border: "1px solid #ccc",
                      padding: 8,
                    }}
                  >
                    <div>{new Date(label as number).toUTCString()}</div>
                    <div style={{ marginTop: 4 }}>
                      price : {fmt.format(price)}
                    </div>
                  </div>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize: 12, color: "#555" }}>
        <div>Last update: {lastPoint ? formatUtc(lastPoint.ts) : "-"}</div>
        <div>
          1h Avg:{" "}
          {hourlyAverage != null ? (
            <strong>
              {fmt.format(hourlyAverage)} {quoteAsset}
            </strong>
          ) : (
            "-"
          )}
        </div>
      </div>
    </div>
  );
}
