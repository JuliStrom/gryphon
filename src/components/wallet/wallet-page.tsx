import Image from "next/image";
import Link from "next/link";

export default function WalletPage({ returnTo }: { returnTo: string }) {
  return <main className="wallet-page">
    <div className="wallet-page-header"><Link href="/" aria-label="Gryphon home"><Image src="/brand/logo-gold.png" width={2172} height={724} alt="Gryphon" className="wallet-page-logo" sizes="190px" preload /></Link><Link href={returnTo} className="wallet-back">← Back</Link></div>
    <section className="wallet-card" aria-labelledby="wallet-heading">
      <div className="wallet-card-symbol" aria-hidden="true">◇</div>
      <p className="wallet-eyebrow">YOUR KEY TO THE REALM · DEMO</p>
      <h1 id="wallet-heading">Choose your wallet.</h1>
      <p className="wallet-intro">Explore the Gryphon demo wallet with a sample portfolio.</p>
      <div className="wallet-options">
        <Link href="/wallet" className="wallet-choice metamask"><span className="wallet-choice-icon">M</span><span className="wallet-choice-name"><strong>MetaMask</strong></span><span className="wallet-choice-status detected">Detected</span></Link>
        {[["Rabby Wallet", "R"], ["Coinbase Wallet", "C"]].map(([name, icon]) => <button key={name} className="wallet-choice" disabled><span className="wallet-choice-icon">{icon}</span><span className="wallet-choice-name"><strong>{name}</strong></span><span className="wallet-choice-status">Not installed</span></button>)}
      </div>
      <p className="wallet-help">Demo availability is simulated. MetaMask opens a preview without connecting an extension.</p>
      <div className="wallet-card-footer">Sample balances only · No real funds or transactions.</div>
    </section>
    <p className="wallet-page-footer">FORTUNE · LEGACY · ETERNITY</p>
  </main>;
}
