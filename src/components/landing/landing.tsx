import Header from "@/components/layout/header";
import Link from "next/link";

export default function Landing() {
    return <main className="landing">
        <Header variant="landing"/>
        <section className="hero" id="legacy"><h1 className="pyramid-slogan">
            <span>EMPIRES FALL,</span>{" "}
            <span>GOLD REMEMBERS,</span>{" "}
            <span>AND THE GRYPHON KEEPS</span>{" "}
            <span>WHAT TIME CANNOT ERASE.</span>
        </h1>
            <div className="hero-caption"><span>FORTUNE · LEGACY · ETERNITY</span><span>EST. MMXXVI</span></div>
        </section>
        <div className="scene-space" aria-hidden="true"/>
        <footer id="enter"><p>TIME PASSES.<br/><span>THE GRYPHON REMAINS.</span></p>
            <Link className="enter-link" href="/realm"><span>ENTER THE REALM</span></Link>
            <p>KEEP WHAT MATTERS.<br/><span>© GRYPHON 2026</span></p></footer>
    </main>;
}
