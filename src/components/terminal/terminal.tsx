"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { INTERVALS, MARKETS, formatPrice, type Interval } from "@/lib/market/types";
import { marketQueryOptions } from "@/lib/market/market-query";
import PriceChart from "./price-chart";
import SentimentChart from "./sentiment-chart";
import WalletLink from "@/components/wallet/wallet-link";
import { useWatchlist } from "@/lib/market/watchlist";

const compact = (value: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);

export default function Terminal({ initialSymbol = "BTCUSDT" }: { initialSymbol?: string }) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [interval, setIntervalValue] = useState<Interval>("all");
  const marketQuery = useQuery(marketQueryOptions(symbol, interval));
  const data = marketQuery.data;
  const error = marketQuery.error?.message ?? "";
  const loading = marketQuery.isFetching;
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"overview" | "watchlist">("overview");
  const { watchlist, toggleWatch: toggleSavedMarket } = useWatchlist();

  const catalog = data?.catalog ?? [];
  const selected = catalog.find((market) => market.symbol === symbol) ?? MARKETS.find((market) => market.symbol === symbol) ?? { symbol, asset: symbol.replace(/USDT$/, ""), name: symbol.replace(/USDT$/, "") };
  const quote = data?.markets.find((market) => market.symbol === symbol);
  const chartData = data?.symbol === symbol && data.interval === interval ? data.candles : null;
  const markets = catalog.filter((market) => `${market.asset} ${market.name}`.toLowerCase().includes(search.toLowerCase()));
  const saved = watchlist.includes(symbol);
  const toggleWatch = () => toggleSavedMarket(symbol);
  return <main className="terminal">
    <header className="terminal-header">
      <Link href="/" aria-label="Gryphon home"><Image src="/brand/logo-gold.png" width={2172} height={724} alt="Gryphon" className="terminal-logo" sizes="145px" preload/></Link>
      <nav className="terminal-nav" aria-label="Terminal navigation"><Link href="/terminal" className="terminal-tab active" aria-current="page">TRADE</Link><Link href="/dashboard" className="terminal-tab">DASHBOARD</Link><Link href="/wallet" className="terminal-tab">WALLET</Link></nav>
      <div className="terminal-header-actions">
        <a className="terminal-social" href="https://x.com/TryGryphon" target="_blank" rel="noopener noreferrer" aria-label="Gryphon on X (opens in a new tab)" title="Gryphon on X">𝕏</a>
        <div className="terminal-status" title={error ? "Market data connection failed" : loading ? "Updating market data" : "Market data updates every five minutes"}><i className={error ? "offline" : ""}/>{error ? "OFFLINE" : loading ? "SYNC" : "LIVE"}</div>
        <WalletLink className="terminal-wallet" />
      </div>
    </header>
    <div className="terminal-workspace">
      <aside className="market-sidebar">
        <div className="panel-title" title="Top 80 active USDT pairs by 24-hour trading volume">MARKETS <span>{catalog.length || "…"}</span></div>
        <label className="market-search"><span className="sr-only">Search cryptocurrency</span><input placeholder="Search asset…" value={search} onChange={(event) => setSearch(event.target.value)}/></label>
        <div className="market-columns"><span>ASSET</span><span>PRICE / 24H</span></div>
        <div className="market-list">{markets.map((market) => { const ticker = data?.markets.find((quote) => quote.symbol === market.symbol); return <button key={market.symbol} className={`market-row ${market.symbol === symbol ? "selected" : ""}`} onClick={() => setSymbol(market.symbol)} aria-pressed={market.symbol === symbol}><span><strong>{market.asset}</strong><small>{market.name}</small></span><span><b>{ticker ? formatPrice(ticker.price) : "—"}</b><small className={ticker && ticker.change < 0 ? "negative" : "positive"}>{ticker ? `${ticker.change > 0 ? "+" : ""}${ticker.change.toFixed(2)}%` : "—"}</small></span></button>; })}{!markets.length && <p className="terminal-empty" role="status">{catalog.length ? "No assets match your search." : loading ? "Loading markets?" : "Market list is unavailable. Use Retry to load markets."}</p>}</div>
        <div className="market-source">BINANCE SPOT<br/><span>Prices quoted in USDT</span></div>
      </aside>
      <section className={`terminal-center${tab === "watchlist" ? " terminal-center-watchlist" : ""}`}>
        <div className="chart-panel">
          <div className="chart-heading"><h1>{selected.asset}<span>/USDT</span></h1><div className="timeframes" aria-label="Chart time range">{INTERVALS.map((value) => <button key={value} className={interval === value ? "active" : ""} aria-pressed={interval === value} onClick={() => setIntervalValue(value)}>{value}</button>)}</div><div className="chart-quote"><strong>{quote ? formatPrice(quote.price) : "—"}</strong><span className={quote && quote.change < 0 ? "negative" : "positive"}>{quote ? `${quote.change > 0 ? "+" : ""}${quote.change.toFixed(2)}%` : "—"}<small>24h</small></span></div></div>
          {error && <div className="market-error" role="alert">{error}{chartData && " Showing the last available data."}<button onClick={() => void marketQuery.refetch()}>Retry</button></div>}
          {chartData ? <PriceChart key={`${symbol}-${interval}`} candles={chartData} interval={interval}/> : <div className="chart-placeholder" role="status">{loading ? <><span className="chart-loader"/>Loading {selected.asset} market data…</> : "Price chart is unavailable. Use Retry to request data again."}</div>}
          <div className="chart-refresh"><span>{data ? `Updated ${new Date(data.updatedAt).toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC` : "Waiting for market data"}</span><button disabled={loading} onClick={() => void marketQuery.refetch()}>{loading ? "Updating…" : "↻ Refresh"}</button><span>Auto refresh · 5 min</span></div>
        </div>
        <SentimentChart interval={interval}/>
        <section className="market-overview"><div className="overview-tabs"><button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Market overview</button><button className={tab === "watchlist" ? "active" : ""} onClick={() => setTab("watchlist")}>Watchlist ({watchlist.length})</button></div>{tab === "overview" ? <div className="overview-content"><div><span>24H HIGH</span><strong>{quote ? formatPrice(quote.high) : "—"}</strong></div><div><span>24H LOW</span><strong>{quote ? formatPrice(quote.low) : "—"}</strong></div><div><span>24H VOLUME</span><strong>{quote ? compact(quote.volume) : "—"}<small> {selected.asset}</small></strong></div><div><span>24H TURNOVER</span><strong>{quote ? `$${compact(quote.quoteVolume)}` : "—"}</strong></div></div> : <div className="watchlist-content">{watchlist.length ? watchlist.map((item) => { const ticker = data?.markets.find((quote) => quote.symbol === item); return <button key={item} onClick={() => setSymbol(item)}><span>{item.replace("USDT", " / USDT")}</span><strong>{ticker ? formatPrice(ticker.price) : "—"}</strong></button>; }) : <p>Add assets using the star in the asset details panel.</p>}</div>}</section>
      </section>
      <aside className="asset-panel"><div className="panel-title">ASSET DETAILS <button className="watch-star" aria-label={saved ? "Remove from watchlist" : "Add to watchlist"} aria-pressed={saved} onClick={toggleWatch}>{saved ? "★" : "☆"}</button></div><div className="asset-details"><div className="asset-monogram">{selected.asset.slice(0, 1)}</div><h2>{selected.name}</h2><p>{selected.asset} / USDT</p><div className="asset-price">{quote ? formatPrice(quote.price) : "—"}<small> USDT</small></div><span className={`asset-change ${quote && quote.change < 0 ? "negative" : "positive"}`}>{quote ? `${quote.change > 0 ? "+" : ""}${quote.change.toFixed(2)}% over 24 hours` : "Waiting for price"}</span><dl><div><dt>Market</dt><dd>Spot</dd></div><div><dt>Quote currency</dt><dd>USDT</dd></div><div><dt>Chart time range</dt><dd>{interval}</dd></div><div><dt>Loaded candles</dt><dd>{chartData?.length ?? "—"}</dd></div><div><dt>Refresh interval</dt><dd>5 minutes</dd></div></dl><button className="watch-button" onClick={toggleWatch}>{saved ? "Remove from watchlist" : "+ Add to watchlist"}</button><p className="asset-footnote">Explore price history, compare intervals and draw your own trend lines.</p></div></aside>
    </div>
    <div className="terminal-footer"><span>GRYPHON / MARKET TERMINAL</span><span>SPOT DATA · USDT · UTC</span><span>FORTUNE · LEGACY · ETERNITY</span></div>
  </main>;
}
