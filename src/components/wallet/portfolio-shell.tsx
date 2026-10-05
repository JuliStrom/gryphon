import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/styles/demo-wallet.css";
import "@/styles/dashboard.css";
import "@/styles/dashboard-overview.css";
import "@/styles/dashboard-watchlist.css";
import "@/styles/portfolio-sidebar.css";

export default function PortfolioShell({ active, children }: { active: "dashboard" | "wallet"; children: ReactNode }) {
  return <main className={`demo-wallet dw-dashboard dw-portfolio-shell${active === "wallet" ? " dw-wallet-restored" : ""}`}>
    <aside className="dw-sidebar">
      <Link href="/" className="dw-brand" aria-label="Gryphon home"><Image src="/brand/logo-gold.png" width={2172} height={724} alt="Gryphon" className="dw-brand-logo" sizes="180px" preload /></Link>
      <div className="dw-navigation" aria-label="Application navigation">
        <Link href="/terminal" aria-label="Trade"><span>↗</span><b>Trade</b></Link>
        <Link href="/dashboard" aria-label="Dashboard" className={active === "dashboard" ? "selected" : ""} aria-current={active === "dashboard" ? "page" : undefined}><span>▦</span><b>Dashboard</b></Link>
        <Link href="/wallet" aria-label="Wallet" className={active === "wallet" ? "selected" : ""} aria-current={active === "wallet" ? "page" : undefined}><span>◇</span><b>Wallet</b></Link>
        <Link href="/wallet#portfolio-assets"><span>◈</span><b>My assets</b></Link>
        <Link href="/wallet#portfolio-activity"><span>◷</span><b>Activity</b></Link>
      </div>
      <div className="dw-sidebar-note"><p>Your assets. Your overview.<br/>Build your conviction.</p><small>Sample data · No wallet connected</small></div>
      <Link href="/connect-wallet" className="dw-exit">Choose a wallet →</Link>
    </aside>
    <div className="dw-main"><div className="dw-content">
      <div className="dw-page-title"><div><h1>{active === "wallet" ? "Wallet" : "Dashboard"}</h1></div><Link href="/terminal" className="dw-back" aria-label="Back to Trade">← Back</Link></div>
      {children}
    </div></div>
  </main>;
}
