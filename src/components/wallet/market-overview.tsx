"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_ASSETS } from "@/lib/market/demo-portfolio";
import type { SentimentPoint } from "@/lib/market/sentiment";

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const gaugePoint = (value: number) => {
  const angle = Math.PI * (1 - value / 100);
  return { x: 100 + Math.cos(angle) * 64, y: 100 - Math.sin(angle) * 64 };
};
const zones = [
  { start: 0, end: 25, color: "#ff6577" },
  { start: 25, end: 45, color: "#ef9a42" },
  { start: 45, end: 55, color: "#edc875" },
  { start: 55, end: 75, color: "#acd65e" },
  { start: 75, end: 100, color: "#4bdaa2" },
];

export default function MarketOverview() {
  const [sentiment, setSentiment] = useState<SentimentPoint | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/sentiment", { signal: controller.signal });
        if (!response.ok) throw new Error("Sentiment unavailable");
        const payload = await response.json();
        const latest = payload.points?.[payload.points.length - 1];
        if (!latest || !Number.isFinite(latest.value) || latest.value < 0 || latest.value > 100) throw new Error("Invalid sentiment");
        if (!controller.signal.aborted) { setSentiment(latest); setError(false); }
      } catch { if (!controller.signal.aborted) setError(true); }
    }
    void load();
    const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 3_600_000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [retry]);
  const dot = gaugePoint(sentiment?.value ?? 50);
  const season = 60;

  return <section className="dw-market-overview" aria-label="Market overview and sentiment">
    <div className="dw-ticker-grid">{["BTC", "ETH", "BNB", "SOL"].map((symbol, assetIndex) => {
      const asset = DEMO_ASSETS.find((item) => item.symbol === symbol)!;
      const values = Array.from({ length: 25 }, (_, index) => 32 - index * .65 + Math.sin(index * 1.3 + assetIndex) * 5 + Math.cos(index * .7) * 3);
      return <Link href={`/terminal?symbol=${symbol}USDT`} className="dw-ticker-card" key={symbol} aria-label={`Open ${asset.name} market chart`}>
        <div className="dw-ticker-name"><span style={{ background: `${asset.color}25`, color: asset.color }}>{asset.icon}</span><strong>{asset.name}</strong><small>{symbol}</small></div>
        <div className="dw-ticker-body"><div><strong>{money(asset.price)}</strong><span className={asset.change < 0 ? "dw-negative" : "dw-positive"}>{asset.change < 0 ? "↓" : "↑"} {Math.abs(asset.change).toFixed(2)}%</span></div><svg viewBox="0 0 100 45" aria-hidden="true"><polyline points={values.map((value, index) => `${index / 24 * 100},${value}`).join(" ")} fill="none" stroke={asset.change < 0 ? "#ff7c86" : "#4bdaa2"} strokeWidth="1.5" strokeLinejoin="round"/></svg></div>
        <span className="dw-ticker-caption">Sample price · 24h</span>
      </Link>;
    })}</div>
    <div className="dw-index-grid">
      <section className="dw-panel dw-fear-card" aria-labelledby="dashboard-fear-title"><div className="dw-panel-title"><h2 id="dashboard-fear-title">Fear &amp; Greed Index</h2><span title="Bitcoin sentiment from 0 (extreme fear) to 100 (extreme greed). Updated daily.">Bitcoin · Daily</span></div>
        {error ? <div className="dw-index-empty" role="status">Index unavailable <button onClick={() => setRetry(retry + 1)}>Retry</button></div> : !sentiment ? <div className="dw-index-empty" role="status">Loading index…</div> : <div className="dw-fear-gauge"><svg viewBox="0 0 200 130" role="img" aria-label={`Fear and Greed Index: ${sentiment.value} out of 100, ${sentiment.classification}`}>
          {zones.map((zone) => { const start = gaugePoint(zone.start + 1), end = gaugePoint(zone.end - 1); return <path key={zone.start} d={`M${start.x} ${start.y} A64 64 0 0 1 ${end.x} ${end.y}`} fill="none" stroke={zone.color} strokeWidth="6" strokeLinecap="round"/>; })}
          <circle cx={dot.x} cy={dot.y} r="6" fill="#edf2f8" stroke="#102840" strokeWidth="3"/>
          <text x="100" y="94" textAnchor="middle" className="dw-gauge-number">{sentiment.value}</text><text x="100" y="114" textAnchor="middle" className="dw-gauge-state">{sentiment.classification}</text>
        </svg></div>}
        <div className="dw-index-caption"><span>Source: Alternative.me</span><span>{sentiment ? new Date(sentiment.time).toLocaleDateString("en-GB", { timeZone: "UTC" }) : "0–100"}</span></div>
      </section>
      <section className="dw-panel dw-season-card" aria-labelledby="dashboard-season-title"><div className="dw-panel-title"><h2 id="dashboard-season-title">Altcoin Season Index</h2><span className="dw-demo-badge">DEMO</span></div>
        <div className="dw-season-value"><strong>{season}<small>/100</small></strong><span>Neutral market</span></div>
        <div className="dw-season-labels"><span>Bitcoin season</span><span>Altcoin season</span></div>
        <div className="dw-season-bar" role="meter" aria-label="Demo Altcoin Season Index" aria-valuemin={0} aria-valuemax={100} aria-valuenow={season} aria-valuetext="60 out of 100. Demo value, neutral market."><i style={{ left: `${season}%` }}/></div>
        <div className="dw-season-ticks"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
        <p className="dw-season-description">Below 25: Bitcoin season · Above 75: altcoin season</p><div className="dw-index-caption"><span>Sample index · 90-day comparison</span><span>Live source not connected</span></div>
      </section>
    </div>
  </section>;
}
