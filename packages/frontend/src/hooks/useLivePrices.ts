import { useEffect, useRef, useState } from "react";
import type { Pair, Tick } from "@app/shared";
import { ServerEventType, ConnectionStateEnum } from "@app/shared";

export type PricePoint = { ts: number; price: number };
export type PriceSeries = Record<Pair, PricePoint[]>;

export function useLivePrices(pairs: Pair[]) {
  const [connectionState, setConnectionState] = useState(
    ConnectionStateEnum.CONNECTING
  );
  const [series, setSeries] = useState<PriceSeries>(() => {
    return pairs.reduce((acc, p) => {
      acc[p] = [];
      return acc;
    }, {} as PriceSeries);
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/events");
    eventSourceRef.current = es;
    setConnectionState(ConnectionStateEnum.CONNECTING);
    es.onopen = () => setConnectionState(ConnectionStateEnum.CONNECTED);
    es.onerror = () => setConnectionState(ConnectionStateEnum.DISCONNECTED);
    es.onmessage = (msg) => {
      try {
        const ev = JSON.parse(msg.data) as {
          type: ServerEventType;
          data: unknown;
        };
        if (ev.type === ServerEventType.TICK) {
          const t = ev.data as Tick;
          setSeries((prev) => {
            if (!(t.pair in prev)) return prev;
            const next = { ...prev };
            const arr = [...next[t.pair], { ts: t.ts, price: t.price }].slice(
              -60
            );
            next[t.pair] = arr;
            return next;
          });
        }
      } catch {}
    };
    return () => es.close();
  }, [pairs.join(",")]);

  return { connectionState, series } as const;
}
