import { CHART_RANGES, type Interval } from "./types";

export const DEMO_ASSETS = [
  { name: "Bitcoin", symbol: "BTC", icon: "₿", color: "#efb654", balance: .8624, price: 60798.23, change: 2.36 },
  { name: "Ethereum", symbol: "ETH", icon: "◆", color: "#658bff", balance: 4.5721, price: 3106.21, change: 3.94 },
  { name: "Solana", symbol: "SOL", icon: "≋", color: "#a38aff", balance: 28.415, price: 164.89, change: 6.21 },
  { name: "Tether", symbol: "USDT", icon: "₮", color: "#36c39b", balance: 12540, price: 1, change: -.01 },
  { name: "BNB", symbol: "BNB", icon: "◇", color: "#e6c55a", balance: 8.25, price: 585.62, change: 1.12 },
  { name: "XRP", symbol: "XRP", icon: "×", color: "#8fa7bc", balance: 9000, price: .5731, change: -.48 },
] as const;
export const DEMO_TOTAL = DEMO_ASSETS.reduce((total, asset) => total + asset.balance * asset.price, 0);
export const DEMO_END = Date.UTC(2026, 9, 5, 12);
const PERFORMANCE: Record<Interval, number> = { "24h": 3.24, "7d": 8.12, "30d": 12.56, "1y": 38.4, all: 68.2 };
export function portfolioHistory(range: Interval) {
  const duration = range === "all" ? 3 * 365 * 86_400_000 : CHART_RANGES[range].duration;
  const initial = DEMO_TOTAL / (1 + PERFORMANCE[range] / 100);
  return Array.from({ length: 49 }, (_, index) => {
    const progress = index / 48;
    const variation = Math.sin(index * .9) * Math.sin(progress * Math.PI) * DEMO_TOTAL * .007;
    return { time: DEMO_END - duration + duration * progress, value: initial + (DEMO_TOTAL - initial) * progress + variation };
  });
}
