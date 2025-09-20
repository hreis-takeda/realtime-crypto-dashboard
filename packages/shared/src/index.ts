export enum PairEnum {
  ETH_USDC = "ETH/USDC",
  ETH_USDT = "ETH/USDT",
  ETH_BTC = "ETH/BTC",
}
export type Pair = `${PairEnum}`;

export interface Tick {
  pair: Pair;
  price: number;
  ts: number; // epoch ms
}

export interface HourlyAverage {
  pair: Pair;
  hourIso: string;
  avg: number;
}

export enum ServerEventType {
  TICK = "tick",
  HOURLY = "hourly",
  STATUS = "status",
}

export enum ConnectionStateEnum {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
}

export type ServerEvent =
  | { type: ServerEventType.TICK; data: Tick }
  | { type: ServerEventType.HOURLY; data: HourlyAverage }
  | {
      type: ServerEventType.STATUS;
      data: { state: ConnectionStateEnum };
    };
