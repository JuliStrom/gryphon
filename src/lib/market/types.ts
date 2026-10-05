export const MARKETS = [
  { symbol: "BTCUSDT", asset: "BTC", name: "Bitcoin" },
  { symbol: "ETHUSDT", asset: "ETH", name: "Ethereum" },
  { symbol: "SOLUSDT", asset: "SOL", name: "Solana" },
  { symbol: "BNBUSDT", asset: "BNB", name: "BNB" },
  { symbol: "XRPUSDT", asset: "XRP", name: "XRP" },
  { symbol: "DOGEUSDT", asset: "DOGE", name: "Dogecoin" },
  { symbol: "AVAXUSDT", asset: "AVAX", name: "Avalanche" },
  { symbol: "ADAUSDT", asset: "ADA", name: "Cardano" },
  { symbol: "LINKUSDT", asset: "LINK", name: "Chainlink" },
  { symbol: "DOTUSDT", asset: "DOT", name: "Polkadot" },
  { symbol: "LTCUSDT", asset: "LTC", name: "Litecoin" },
  { symbol: "SUIUSDT", asset: "SUI", name: "Sui" },
] as const;
export const INTERVALS = ["24h", "7d", "30d", "1y", "all"] as const;
export type Interval = typeof INTERVALS[number];
// Toolbar values describe the visible time range, independently of candle size.
export const CHART_RANGES = {
  "24h": { duration: 86_400_000, candleInterval: "15m", candleDuration: 900_000 },
  "7d": { duration: 7 * 86_400_000, candleInterval: "1h", candleDuration: 3_600_000 },
  "30d": { duration: 30 * 86_400_000, candleInterval: "4h", candleDuration: 14_400_000 },
  "1y": { duration: 365 * 86_400_000, candleInterval: "1d", candleDuration: 86_400_000 },
  "all": { duration: 0, candleInterval: "1w", candleDuration: 7 * 86_400_000 },
} as const;
export type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number };
export type Market = { symbol: string; price: number; change: number; high: number; low: number; volume: number; quoteVolume: number; closeTime: number };
export type MarketDefinition = { symbol: string; asset: string; name: string };
export type MarketResponse = { catalog: MarketDefinition[]; markets: Market[]; candles: Candle[]; symbol: string; interval: Interval; updatedAt: string; source: string };
export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: value < 1 ? 6 : value < 10 ? 4 : 2 }).format(value);
}
