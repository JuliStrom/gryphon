"use client";

import { useEffect, useId, useState } from "react";
import { CHART_RANGES, type Interval } from "@/lib/market/types";
import type { SentimentPoint } from "@/lib/market/sentiment";

export default function SentimentChart({ interval }: { interval: Interval }) {
  const gradientId = useId();
  const [points, setPoints] = useState<SentimentPoint[]>([]);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/sentiment", { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load sentiment.");
        if (!Array.isArray(payload.points) || !payload.points.length) throw new Error("No sentiment history available.");
        if (!controller.signal.aborted) { setPoints(payload.points); setError(""); }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to load sentiment.");
      }
    }
    void load();
    const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 3_600_000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [retry]);

  const latest = points[points.length - 1];
  const end = latest?.time ?? 0;
  const start = interval === "all" ? points[0]?.time ?? 0 : end - CHART_RANGES[interval].duration;
  const visible = points.filter((point) => point.time >= start);
  const selected = hover === null ? latest : visible[Math.min(hover, visible.length - 1)] ?? latest;
  const x = (time: number) => 20 + (time - start) / Math.max(1, end - start) * 900;
  const y = (value: number) => 100 - value * .8;
  const color = (value: number) => value < 25 ? "#ff354f" : value < 45 ? "#ff9200" : value <= 55 ? "#ffd500" : value < 75 ? "#96df00" : "#00cd8b";
  const date = (time: number) => new Date(time).toLocaleDateString("en-GB", { timeZone: "UTC", day: "2-digit", month: "short", ...(interval === "1y" || interval === "all" ? { year: "2-digit" as const } : {}) });

  return <section className="sentiment-panel" aria-labelledby="sentiment-heading">
    <div className="sentiment-heading"><h2 id="sentiment-heading">FEAR &amp; GREED <span>Bitcoin sentiment · Daily</span></h2>{selected && <div className="sentiment-value" style={{ color: color(selected.value) }}><strong>{selected.value}<small>/100</small></strong><span>{selected.classification}</span></div>}</div>
    {error ? <div className="sentiment-message" role="alert">{error}<button onClick={() => setRetry(retry + 1)}>Retry</button></div> : !latest ? <div className="sentiment-message" role="status">Loading sentiment history…</div> : <svg className="sentiment-svg" viewBox="0 0 1000 130" preserveAspectRatio="none" role="img" aria-label={`Bitcoin Fear and Greed Index over ${interval}, from 0 extreme fear to 100 extreme greed`} onPointerMove={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = (event.clientX - bounds.left) / bounds.width * 1000;
      setHover(visible.reduce((best, point, index) => Math.abs(x(point.time) - position) < Math.abs(x(visible[best].time) - position) ? index : best, 0));
    }} onPointerLeave={() => setHover(null)}>
      <defs><linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1={y(100)} x2="0" y2={y(0)}>
        <stop offset="0%" stopColor="#00cd8b"/><stop offset="25%" stopColor="#00cd8b"/>
        <stop offset="25%" stopColor="#96df00"/><stop offset="45%" stopColor="#96df00"/>
        <stop offset="45%" stopColor="#ffd500"/><stop offset="55%" stopColor="#ffd500"/>
        <stop offset="55%" stopColor="#ff9200"/><stop offset="75%" stopColor="#ff9200"/>
        <stop offset="75%" stopColor="#ff354f"/><stop offset="100%" stopColor="#ff354f"/>
      </linearGradient></defs>
      {[{ low: 75, high: 100, label: "Extreme greed", fill: "#00cd8b18" }, { low: 55, high: 75, label: "Greed", fill: "#96df0007" }, { low: 45, high: 55, label: "Neutral", fill: "#ffd50007" }, { low: 25, high: 45, label: "Fear", fill: "#ff920007" }, { low: 0, high: 25, label: "Extreme fear", fill: "#ff354f18" }].map((zone) => <g key={zone.label}>
        <rect x="20" y={y(zone.high)} width="900" height={y(zone.low) - y(zone.high)} fill={zone.fill}/>
        <text x="932" y={y((zone.low + zone.high) / 2) + 3} className="sentiment-zone-label">{zone.label}</text>
      </g>)}
      {[0, 25, 45, 55, 75, 100].map((value) => <g key={value}><path d={`M20 ${y(value)}H920`} className="chart-grid" strokeDasharray="2 4"/><text x="2" y={y(value) + 3} className="sentiment-tick">{value}</text></g>)}
      <path d={visible.map((point, index) => `${index ? "L" : "M"}${x(point.time)} ${y(point.value)}`).join(" ")} fill="none" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinejoin="round"/>
      {selected && <circle cx={x(selected.time)} cy={y(selected.value)} r="3" fill={color(selected.value)}><title>{date(selected.time)}: {selected.value} · {selected.classification}</title></circle>}
      {[0, .5, 1].map((part) => <text key={part} x={20 + part * 900} y="122" textAnchor={part === 0 ? "start" : part === 1 ? "end" : "middle"} className="chart-axis">{date(start + (end - start) * part)}</text>)}
    </svg>}
    <div className="sentiment-footer"><span>{selected ? `${date(selected.time)} · UTC` : "0 = Extreme fear · 100 = Extreme greed"}</span><span>Source: Alternative.me</span></div>
  </section>;
}
