import { useEffect, useMemo, useState } from "react";
import type { Pair } from "@app/shared";

export function useHourlyAverages(pairs: Pair[]) {
  const initial = useMemo(
    () =>
      pairs.reduce(
        (acc, p) => ((acc[p] = undefined), acc),
        {} as Record<Pair, number | undefined>
      ),
    [pairs]
  );
  const [averages, setAverages] =
    useState<Record<Pair, number | undefined>>(initial);

  useEffect(() => {
    let stopped = false;
    const load = async () => {
      try {
        const res = await fetch("/rates/hourly");
        if (!res.ok) return;
        const arr = (await res.json()) as Array<{ pair: Pair; avg: number }>;
        if (stopped) return;
        const next = { ...initial };
        for (const { pair, avg } of arr) next[pair] = avg;
        setAverages(next);
      } catch {}
    };
    load();
    const id = setInterval(load, 5000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [initial]);

  return averages;
}
