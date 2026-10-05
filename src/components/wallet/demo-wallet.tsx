"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import PortfolioShell from "./portfolio-shell";
import "@/styles/wallet-restored.css";
import { DEMO_ASSETS, DEMO_TOTAL, portfolioHistory } from "@/lib/market/demo-portfolio";
import { INTERVALS, type Interval } from "@/lib/market/types";

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value < 1 ? 4 : 2 }).format(value);
const transactions = [
  { icon: "↓", name: "Received USDT", date: "05 Oct 2026", amount: "+1,250.00 USDT", negative: false },
  { icon: "↗", name: "Sent ETH", date: "04 Oct 2026", amount: "−0.2500 ETH", negative: true },
  { icon: "⇄", name: "Swapped SOL → USDT", date: "03 Oct 2026", amount: "+1,320.45 USDT", negative: false },
  { icon: "◇", name: "Bought BTC", date: "02 Oct 2026", amount: "+0.0154 BTC", negative: false },
];

export default function DemoWallet() {
  const [action, setAction] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (action && !dialog.current?.open) dialog.current?.showModal();
    if (!action && dialog.current?.open) dialog.current.close();
  }, [action]);
  const gradient = useId();
  const [range, setRange] = useState<Interval>("24h");
  const [hover, setHover] = useState<number | null>(null);
  const history = portfolioHistory(range);
  const gain = DEMO_TOTAL - history[0].value;
  const change = gain / history[0].value * 100;
  const min = Math.min(...history.map((point) => point.value)) * .998;
  const max = Math.max(...history.map((point) => point.value)) * 1.002;
  const x = (index: number) => 12 + index / (history.length - 1) * 716;
  const y = (value: number) => 180 - (value - min) / (max - min) * 155;
  const line = history.map((point, index) => `${index ? "L" : "M"}${x(index)} ${y(point.value)}`).join(" ");
  const date = (time: number) => range === "24h" ? new Date(time).toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" }) : new Date(time).toLocaleDateString("en-GB", { timeZone: "UTC", day: "2-digit", month: "short", ...(range === "1y" || range === "all" ? { year: "2-digit" as const } : {}) });
  const inspected = hover === null ? history[history.length - 1] : history[hover];
  const visibleAssets = DEMO_ASSETS;
  const allocation = DEMO_ASSETS.map((asset, index) => {
    const start = DEMO_ASSETS.slice(0, index).reduce((sum, item) => sum + item.balance * item.price / DEMO_TOTAL * 100, 0);
    const end = start + asset.balance * asset.price / DEMO_TOTAL * 100;
    return `${asset.color} ${start}% ${end}%`;
  }).join(", ");

  return <PortfolioShell active="wallet">
        <div className="dw-dashboard-grid">
          <section className="dw-panel dw-portfolio-chart dw-wallet-hero" aria-labelledby="portfolio-heading">
            <Image src="/brand/wallet.png" width={275} height={168} alt="" className="dw-wallet-artwork" sizes="(max-width: 800px) 100vw, 85vw" preload />
            <div className="dw-portfolio-top"><div><p id="portfolio-heading">Total portfolio value</p><h2>{money(DEMO_TOTAL)}</h2><span className="dw-positive">+{change.toFixed(2)}% <small>+{money(gain)} · {range}</small></span></div><span className="dw-demo-badge">SAMPLE BALANCE</span></div>
            <div className="dw-portfolio-controls"><div className="dw-ranges" aria-label="Portfolio time range">{INTERVALS.map((item) => <button key={item} className={range === item ? "active" : ""} aria-pressed={range === item} onClick={() => { setRange(item); setHover(null); }}>{item}</button>)}</div><span>{money(inspected.value)} · {date(inspected.time)} UTC</span></div>
            <svg className="dw-portfolio-svg" viewBox="0 0 740 210" preserveAspectRatio="none" role="img" aria-label={`Demo portfolio value over ${range}`} onPointerMove={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); const scale = bounds.width / 740; if (scale > 0) setHover(Math.max(0, Math.min(48, Math.round(((event.clientX - bounds.left) / scale - 12) / 716 * 48)))); }} onPointerLeave={() => setHover(null)}>
              <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#dfb75f" stopOpacity=".26"/><stop offset="100%" stopColor="#dfb75f" stopOpacity="0"/></linearGradient></defs>
              {[30, 80, 130, 180].map((position) => <path key={position} d={`M12 ${position}H728`} stroke="#8ca7c320" strokeDasharray="3 5"/>)}
              <path d={`${line} L728 185 L12 185 Z`} fill={`url(#${gradient})`}/><path d={line} fill="none" stroke="#edc875" strokeWidth="2" strokeLinejoin="round"/>
              {hover !== null && <g><path d={`M${x(hover)} 20V185`} stroke="#afbed080" strokeDasharray="4 4"/><circle cx={x(hover)} cy={y(inspected.value)} r="4" fill="#edc875"/></g>}
              {[0, 24, 48].map((index) => <text key={index} x={x(index)} y="204" textAnchor={index === 0 ? "start" : index === 48 ? "end" : "middle"} fill="#9baec4" fontSize="10">{date(history[index].time)}</text>)}
            </svg>
            <p className="dw-chart-caption">Demo history · {range === "all" ? "3 years" : range} · Hover to explore</p>
          </section>
          <div className="dw-actions dw-wallet-actions">{[["↗", "Send", "Send crypto"], ["↓", "Receive", "Receive crypto"], ["◇", "Buy", "Buy with card"], ["↑", "Sell", "Sell to fiat"], ["⇄", "Swap", "Swap tokens"]].map(([icon, name, subtitle]) => <button key={name} onClick={() => setAction(name)}><span className="dw-action-icon">{icon}</span><span><strong>{name}</strong><small>{subtitle}</small></span><b>›</b></button>)}</div>
          <section className="dw-panel dw-portfolio-allocation" aria-labelledby="allocation-heading"><div className="dw-panel-title"><h2 id="allocation-heading">Asset allocation</h2><span>6 assets</span></div><div className="dw-donut" style={{ background: `conic-gradient(${allocation})` }} role="img" aria-label="Portfolio allocation based on the sample asset values"><div><strong>${(DEMO_TOTAL / 1000).toFixed(1)}K</strong><small>Portfolio value</small></div></div><ul className="dw-allocation-list">{DEMO_ASSETS.map((asset) => <li key={asset.symbol}><i style={{ background: asset.color }}/><span>{asset.symbol}</span><b>{(asset.balance * asset.price / DEMO_TOTAL * 100).toFixed(1)}%</b></li>)}</ul></section>
          <section className="dw-panel dw-assets" id="portfolio-assets"><div className="dw-panel-title"><h2>My assets</h2><span>{visibleAssets.length} / {DEMO_ASSETS.length}</span></div><div className="dw-table-scroll"><table><thead><tr>{["Asset", "Amount", "Price", "Value", "24h", "Share"].map((title) => <th key={title}>{title}</th>)}</tr></thead><tbody>{visibleAssets.map((asset) => <tr key={asset.symbol}><td><div className="dw-asset-label"><span className="dw-coin" style={{ background: asset.color }}>{asset.icon}</span><span><strong>{asset.name}</strong><small>{asset.symbol}</small></span></div></td><td>{asset.balance.toLocaleString("en-US", { maximumFractionDigits: 4 })}</td><td>{money(asset.price)}</td><td><strong>{money(asset.balance * asset.price)}</strong></td><td className={asset.change < 0 ? "dw-negative" : "dw-positive"}>{asset.change > 0 ? "+" : ""}{asset.change.toFixed(2)}%</td><td>{(asset.balance * asset.price / DEMO_TOTAL * 100).toFixed(1)}%</td></tr>)}</tbody></table>{!visibleAssets.length && <p className="dw-empty">No assets match your search.</p>}</div></section>
          <section className="dw-panel dw-portfolio-activity" id="portfolio-activity"><div className="dw-panel-title"><h2>Recent activity</h2><span>Demo</span></div>{transactions.map((transaction) => <div className="dw-activity-row" key={transaction.name}><span className="dw-transaction-icon">{transaction.icon}</span><div><strong>{transaction.name}</strong><small>{transaction.date} · Completed</small></div><div className={transaction.negative ? "dw-negative" : "dw-positive"}><strong>{transaction.amount}</strong></div></div>)}</section>
          <section className="dw-panel dw-wallet-security"><div className="dw-panel-title"><h2>Security &amp; wallet status</h2><span>Preview</span></div>{[["◇", "Wallet backup", "Sample backup status"], ["◈", "Device security", "Sample device status"], ["♧", "Transaction protection", "Simulation mode"]].map(([icon, name, detail]) => <div className="dw-security-row" key={name}><span>{icon}</span><div><strong>{name}</strong><small>{detail}</small></div><b className="dw-status">Demo</b></div>)}</section>
        </div>
        <dialog ref={dialog} className="dw-modal dw-native-dialog" aria-labelledby="wallet-action-title" onCancel={() => setAction(null)} onClose={() => setAction(null)}><button className="dw-modal-close" aria-label="Close dialog" onClick={() => setAction(null)}>×</button><span className="dw-demo-badge">DEMO PREVIEW</span><h2 id="wallet-action-title">{action}</h2><p>This is a demonstration wallet. This action does not transfer funds or request access to a real wallet.</p><button className="dw-modal-done" onClick={() => setAction(null)}>Got it</button></dialog>
        <p className="dw-footnote">Demo portfolio · Balances, prices, history and activity are sample data.</p>
  </PortfolioShell>;
}
