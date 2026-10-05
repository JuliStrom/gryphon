import type {Metadata} from "next";
import WalletPage from "@/components/wallet/wallet-page";

export const metadata: Metadata = {
    title: "Connect Wallet — Gryphon",
    description: "Choose a demo wallet and explore the Gryphon sample portfolio."
};
export default async function ConnectWalletPage({searchParams}: { searchParams: Promise<{ returnTo?: string }> }) {
    const params = await searchParams;
    const returnTo = params.returnTo === "/realm" ? "/realm" : "/terminal";
    return <WalletPage returnTo={returnTo}/>;
}
