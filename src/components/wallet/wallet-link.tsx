"use client";
import Link from "next/link";
import { useConnection } from "wagmi";

export default function WalletLink({ className, returnTo = "/terminal" }: { className: string; returnTo?: "/terminal" | "/realm" }) {
  const { address, isConnected } = useConnection();
  return <Link className={`${className} connect-wallet-button`} href={`/connect-wallet?returnTo=${encodeURIComponent(returnTo)}`} title={isConnected ? address : "Choose a wallet to connect"}>{isConnected && address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Connect wallet"}</Link>;
}
