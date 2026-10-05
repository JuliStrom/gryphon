import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/header";

function RealmBackdrop() {
    return (
        <div className="realm-gryphon" aria-hidden="true">
            <div className="realm-gryphon-radiance"/>
            <div
                className="realm-gryphon-silhouette"
                style={{maskImage: 'url("/brand/gryphon-main-transparent.png")'}}
            />
            <Image
                src="/brand/gryphon-main-transparent.png"
                alt=""
                fill
                sizes="(max-width: 700px) 100vw, 85vw"
                preload
                className="realm-gryphon-image"
            />
        </div>
    );
}

export default function Realm() {
    return (
        <main className="landing realm">
            <Header/>
            <section className="realm-stage" aria-label="The Gryphon realm">
                <RealmBackdrop/>
                <Link className="realm-back" href="/">↖ BACK TO THE GATE</Link>
                <span className="realm-edition">REALM 001 / A LEGACY BEYOND TIME</span>
            </section>
            <section className="realm-information">
                <div className="realm-project">
                    <h1>The Gryphon realm.</h1>
                    <Link className="realm-action" href="/terminal">GO TO APP <span>↗</span></Link>
                </div>
                <div className="realm-info" id="realm-story">
                    <h2>Built for what endures.</h2>
                    <p className="realm-description">Empires rise and fall. Gold carries their stories forward. Gryphon
                        stands for the things worth keeping — a symbol of strength, a guardian of value, a legacy beyond
                        time.</p>
                    <div className="realm-tags">
                        <span>Gold & legacy</span><span>Strength</span><span>Timeless by nature</span></div>
                    <details className="realm-manifesto">
                        <summary>Our philosophy <span>+</span></summary>
                        <p>Keep what matters. Let the passing of time reveal its value. The Gryphon is our reminder that
                            the most lasting things are the ones we choose to protect.</p></details>
                </div>
            </section>
            <div className="realm-bottom"><span>FORTUNE · LEGACY · ETERNITY</span><span>© GRYPHON 2026</span></div>
        </main>
    );
}
