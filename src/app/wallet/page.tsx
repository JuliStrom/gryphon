import type {Metadata} from "next";
import DemoWallet from "@/components/wallet/demo-wallet";

export const metadata: Metadata = {
    title: "Dashboard — Gryphon",
    description: "Explore your Gryphon demo portfolio, asset allocation, activity and watchlist."
};
export default function WalletDashboardPage() {
    return <DemoWallet/>;
}
