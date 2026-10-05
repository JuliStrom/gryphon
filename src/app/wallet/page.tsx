import type {Metadata} from "next";
import DemoWallet from "@/components/wallet/demo-wallet";

export const metadata: Metadata = {
    title: "Wallet — Gryphon",
    description: "Your Gryphon demo wallet: balance, portfolio history, assets, allocation and activity."
};
export default function WalletDashboardPage() {
    return <DemoWallet/>;
}
