import type { Metadata } from "next";
import Terminal from "@/components/terminal/terminal";

export const metadata: Metadata = { title: "Market Terminal — Gryphon", description: "Cryptocurrency prices and interactive candlestick charts. Market data refreshed every five minutes." };
export default async function TerminalPage({ searchParams }: { searchParams: Promise<{ symbol?: string }> }) {
  const { symbol } = await searchParams;
  const initialSymbol = typeof symbol === "string" && /^[A-Z0-9]{2,30}USDT$/.test(symbol) ? symbol : "BTCUSDT";
  return <Terminal key={initialSymbol} initialSymbol={initialSymbol} />;
}
