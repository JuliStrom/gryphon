import type { Metadata } from "next";
import PortfolioShell from "@/components/wallet/portfolio-shell";
import MarketOverview from "@/components/wallet/market-overview";
import MarketWatchlist from "@/components/wallet/market-watchlist";

export const metadata: Metadata = {
  title: "Dashboard — Gryphon",
  description: "Market overview, Fear & Greed Index, altcoin season and your favorite markets.",
};

export default function DashboardPage() {
  return <PortfolioShell active="dashboard"><MarketOverview /><MarketWatchlist /></PortfolioShell>;
}
