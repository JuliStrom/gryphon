"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice, type Market, type MarketDefinition } from "@/lib/market/types";
import { useWatchlist } from "@/lib/market/watchlist";

export default function MarketWatchlist() {
  const [markets, setMarkets] = useState<(Market & MarketDefinition)[]>([]);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const { watchlist, toggleWatch } = useWatchlist();
  const requestedSymbols = watchlist.join(",");
  useEffect(() => {
    if (!requestedSymbols) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/markets?${new URLSearchParams({ symbols: requestedSymbols })}`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load markets.");
        if (!Array.isArray(payload.markets)) throw new Error("Invalid market response.");
        if (!controller.signal.aborted) { setMarkets(payload.markets); setError(""); }
      } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to load markets."); }
    }
    void load();
    const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 300_000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [retry, requestedSymbols]);

  return <section className="dw-panel dw-portfolio-watchlist" id="portfolio-watchlist">
    <div className="dw-panel-title"><div><h2>Watchlist <span className="dw-watchlist-count">{watchlist.length}</span></h2><small>Your favorites from Trade · USDT</small></div><Link href="/terminal">Open Trade ↗</Link></div>
    {watchlist.length > 0 && error && <p className="dw-watchlist-status" role="alert">{error} <button onClick={() => setRetry(retry + 1)}>Retry</button></p>}
    {!watchlist.length && <p className="dw-watchlist-empty">Add currencies using the star in Trade to see them here.</p>}
    <div className="dw-watchlist-grid">{watchlist.map((symbol) => {
      const market = markets.find((item) => item.symbol === symbol);
      const asset = market?.asset ?? symbol.replace(/USDT$/, "");
      return <article className="dw-watchlist-card dw-watchlist-favorite" key={symbol}>
        <div><strong>{asset}</strong><button onClick={() => toggleWatch(symbol)} aria-label={`Remove ${asset} from favorites`} aria-pressed="true">★</button></div>
        <span>{market?.name ?? asset}</span>{market ? <><strong>${formatPrice(market.price)}</strong><span className={market.change < 0 ? "dw-negative" : "dw-positive"}>{market.change > 0 ? "+" : ""}{market.change.toFixed(2)}% · 24h</span></> : <span>Price unavailable</span>}
        <Link href={`/terminal?symbol=${encodeURIComponent(symbol)}`}>View chart ↗</Link>
      </article>;
    })}</div>
  </section>;
}
