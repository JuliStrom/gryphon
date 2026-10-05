"use client";
import { useState, type PointerEvent } from "react";
import { CHART_RANGES, formatPrice, type Candle, type Interval } from "@/lib/market/types";

type Point = { time: number; price: number };
type Trend = { from: Point; to: Point };

export default function PriceChart({ candles, interval }: { candles: Candle[]; interval: Interval }) {
  const range = CHART_RANGES[interval];
  const [zoomCount, setCount] = useState<number | null>(null);
  const historyCount = (candles[candles.length - 1].time - candles[0].time) / range.candleDuration + 1;
  const count = zoomCount ?? (interval === "all" ? historyCount : range.duration / range.candleDuration);
  const [mode, setMode] = useState<"candles" | "line">("candles");
  const [drawing, setDrawing] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [start, setStart] = useState<Point | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const lastTime = candles[candles.length - 1].time + range.candleDuration;
  const firstTime = lastTime - count * range.candleDuration;
  const visible = candles.filter((candle) => candle.time >= firstTime && candle.time < lastTime);
  const low = Math.min(...visible.map((c) => c.low));
  const high = Math.max(...visible.map((c) => c.high));
  const padding = Math.max((high - low) * 0.12, high * 0.001);
  const min = low - padding, max = high + padding;
  const width = 920, top = 20, bottom = 370;
  const step = width / count;
  const y = (price: number) => bottom - (price - min) / (max - min) * (bottom - top);
  const priceAt = (position: number) => min + (bottom - position) / (bottom - top) * (max - min);
  const x = (time: number) => (time - firstTime) / (lastTime - firstTime) * width;
  const formatTime = (time: number) => count * range.candleDuration > 86_400_000
    ? new Date(time).toLocaleDateString("en-GB", { timeZone: "UTC", day: "2-digit", month: "short", ...(count * range.candleDuration >= 365 * 86_400_000 ? { year: "numeric" as const } : {}) })
    : new Date(time).toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", ...(count * range.candleDuration < 900_000 ? { second: "2-digit" as const } : {}) });
  const last = visible[visible.length - 1];
  const maxVolume = Math.max(...visible.map((candle) => candle.volume), 1);
  const hoveredIndex = pointer ? visible.reduce((nearest, candle, index) => Math.abs(x(candle.time + range.candleDuration / 2) - pointer.x) < Math.abs(x(visible[nearest].time + range.candleDuration / 2) - pointer.x) ? index : nearest, 0) : visible.length - 1;
  const hovered = visible[hoveredIndex];
  function locate(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(width, (event.clientX - bounds.left) / bounds.width * 1000)), y: Math.max(top, Math.min(bottom, (event.clientY - bounds.top) / bounds.height * 440)) };
  }
  function draw(event: PointerEvent<SVGSVGElement>) {
    if (!drawing) return;
    const position = locate(event);
    const point = { time: firstTime + position.x / width * (lastTime - firstTime), price: priceAt(position.y) };
    if (start) { setTrends([...trends, { from: start, to: point }]); setStart(null); }
    else setStart(point);
  }
  return <div className="price-chart">
    <div className="chart-tools"><div className="chart-tool-group"><button className={mode === "candles" ? "active" : ""} onClick={() => setMode("candles")}>Candles</button><button className={mode === "line" ? "active" : ""} onClick={() => setMode("line")}>Line</button><button className={drawing ? "active" : ""} aria-pressed={drawing} onClick={() => { setDrawing(!drawing); setStart(null); }}>↗ Trend line</button><button disabled={!trends.length && !start} onClick={() => { setTrends([]); setStart(null); }}>Clear</button></div><div className="chart-tool-group"><button aria-label="Zoom out" disabled={count >= candles.length} onClick={() => setCount(Math.min(candles.length, Math.ceil(count * 1.5)))}>−</button><button aria-label="Zoom in" disabled={count <= 2} onClick={() => setCount(Math.max(2, Math.round(count / 1.5)))}>+</button></div></div>
    <div className="chart-ohlc"><span>O {formatPrice(hovered.open)}</span><span>H {formatPrice(hovered.high)}</span><span>L {formatPrice(hovered.low)}</span><span>C {formatPrice(hovered.close)}</span><span>{new Date(hovered.time).toLocaleString("en-GB", { timeZone: "UTC" })} UTC</span></div>
    <svg className={drawing ? "chart-svg drawing" : "chart-svg"} viewBox="0 0 1000 440" preserveAspectRatio="none" role="img" aria-label="Price chart. Use the chart controls to zoom, change chart type or draw a trend line." onPointerMove={(event) => setPointer(locate(event))} onPointerLeave={() => setPointer(null)} onClick={draw}>
      <defs><clipPath id="plot-area"><rect width={width} height="400" /></clipPath></defs>
      {Array.from({ length: 7 }, (_, index) => { const price = min + (max - min) * index / 6; return <g key={index}><path d={`M0 ${y(price)}H${width}`} className="chart-grid" /><text x="934" y={y(price) + 4} className="chart-axis">{formatPrice(price)}</text></g>; })}
      {Array.from({ length: 6 }, (_, index) => { const time = firstTime + (lastTime - firstTime) * index / 5; return <g key={index}><path d={`M${x(time)} ${top}V400`} className="chart-grid"/><text x={Math.max(8, Math.min(width - 80, x(time)))} y="425" className="chart-axis">{formatTime(time)}</text></g>; })}
      <g clipPath="url(#plot-area)">
        {mode === "candles" ? visible.map((candle) => { const color = candle.close >= candle.open ? "#55c99f" : "#e6757d"; return <g key={candle.time} stroke={color} fill={color}><path d={`M${x(candle.time) + step / 2} ${y(candle.high)}V${y(candle.low)}`} strokeWidth="1"/><rect x={x(candle.time) + step * 0.18} y={Math.min(y(candle.open), y(candle.close))} width={step * 0.64} height={Math.max(1, Math.abs(y(candle.open) - y(candle.close)))} strokeWidth="0"/></g>; }) : <path d={visible.map((candle, index) => `${index ? "L" : "M"}${x(candle.time + range.candleDuration / 2)} ${y(candle.close)}`).join(" ")} fill="none" stroke="#dfb75f" strokeWidth="2"/>}
        {visible.map((candle) => <rect key={`v${candle.time}`} x={x(candle.time) + step * 0.2} y={400 - candle.volume / maxVolume * 22} width={step * 0.6} height={candle.volume / maxVolume * 22} fill={candle.close >= candle.open ? "#55c99f35" : "#e6757d35"}/>)}
        <path d={`M0 ${y(last.close)}H${width}`} stroke="#dfb75f" strokeDasharray="3 4" strokeWidth=".8"/>
        {trends.map((trend, index) => <line key={index} x1={x(trend.from.time)} y1={y(trend.from.price)} x2={x(trend.to.time)} y2={y(trend.to.price)} stroke="#f5d98b" strokeWidth="2"/>)}
        {start && pointer && <line x1={x(start.time)} y1={y(start.price)} x2={pointer.x} y2={pointer.y} stroke="#f5d98b" strokeDasharray="5 4"/>}
        {pointer && <g className="chart-crosshair"><path d={`M${pointer.x} ${top}V400M0 ${pointer.y}H${width}`} stroke="#9db3c7" strokeDasharray="3 5"/></g>}
      </g>
      {pointer && <g><rect x="922" y={pointer.y - 10} width="78" height="20" fill="#dfb75f"/><text x="928" y={pointer.y + 4} fill="#0c2037" fontSize="11" fontFamily="monospace">{formatPrice(priceAt(pointer.y))}</text></g>}
    </svg>
    <p className="chart-hint">{drawing ? start ? "Click the endpoint to finish your trend line." : "Click two points on the chart to draw a trend line." : "Hover to inspect a candle · Times in UTC · Use + / − to zoom"}</p>
  </div>;
}
