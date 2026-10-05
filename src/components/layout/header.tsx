"use client";
import {useState} from "react";
import Link from "next/link";
import Image from "next/image";
import WalletLink from "@/components/wallet/wallet-link";

export default function Header({ variant = "realm" }: { variant?: "landing" | "realm" }) {
    const [open, setOpen] = useState(false);
    return <>
        <header>
            <Link className="brand" href="/" aria-label="Gryphon home">
            <Image className="header-logo" src="/brand/logo-gold.png" width={2172} height={724}
                   alt="Gryphon"
                   sizes="(max-width: 700px) 180px, 220px"
                   preload/>
            </Link>
            <div className="header-actions">
                {variant === "landing" ? <>
                    <button className="header-wallet" type="button" disabled>Enter</button>
                    <button className="header-launch" type="button" disabled>Registration</button>
                </> : <>
                <WalletLink className="header-wallet" returnTo="/realm" />
                <Link className="header-launch" href="/terminal">Launch app</Link>
                <a className="header-social"
                   href="https://x.com/TryGryphon"
                   target="_blank"
                   rel="noopener noreferrer"
                   aria-label="Gryphon on X (opens in a new tab)"
                   title="Gryphon on X">X
                </a>
                </>}
            </div>
        </header>
        {open && <nav id="navigation">
            <Link href="/#legacy" onClick={() => setOpen(false)}>The
            legacy <span>01</span>
            </Link>
            <Link href="/realm" onClick={() => setOpen(false)}>Enter the
            realm <span>02</span>
            </Link></nav>}
    </>;
}
