"use client";

import { useEffect } from "react";
import type { Container } from "@tsparticles/engine";

export default function ParticleBackground() {
  useEffect(() => {
    let disposed = false;
    let container: Container | undefined;
    let revision = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileScreen = window.matchMedia("(max-width: 700px)");

    async function initialize() {
      const [{ tsParticles }, { loadSlim }] = await Promise.all([
        import("@tsparticles/engine"),
        import("@tsparticles/slim"),
      ]);
      await loadSlim(tsParticles);
      if (disposed) return;

      async function render() {
        const current = ++revision;
        const next = await tsParticles.load({
          id: "gryphon-particles",
          options: {
            fullScreen: { enable: false },
            fpsLimit: 60,
            detectRetina: true,
            pauseOnBlur: true,
            interactivity: {
              detectsOn: "window",
              events: {
                onHover: { enable: !reducedMotion.matches, mode: "repulse" },
                onClick: { enable: false },
              },
              modes: {
                repulse: {
                  distance: 110,
                  speed: 0.385,
                  factor: 2,
                  maxSpeed: 0.66,
                  easing: "ease-out-quad",
                  restore: { enable: false },
                },
              },
            },
            particles: {
              number: { value: mobileScreen.matches ? 68 : 255 },
              color: { value: ["#528abb", "#dfb75f", "#f8f3e7"] },
              shape: { type: "circle" },
              opacity: { value: { min: 0.25, max: 0.7 } },
              size: { value: { min: 0.6, max: 2 } },
              links: { enable: true, color: "#dfb75f", distance: 160, opacity: 0.25, width: 0.8 },
              move: { enable: !reducedMotion.matches, speed: 0.06, outModes: { default: "out" } },
            },
          },
        });
        if (disposed || current !== revision) next?.destroy();
        else container = next;
      }

      // Serialize reloads when the motion preference or screen breakpoint changes.
      let pending = Promise.resolve();
      const refresh = () => {
        pending = pending.then(async () => { if (!disposed) await render(); }).catch(console.error);
      };
      motionListener = refresh;
      reducedMotion.addEventListener("change", refresh);
      mobileScreen.addEventListener("change", refresh);
      refresh();
    }

    let motionListener: (() => void) | undefined;
    void initialize().catch(console.error);
    return () => {
      disposed = true;
      if (motionListener) reducedMotion.removeEventListener("change", motionListener);
      if (motionListener) mobileScreen.removeEventListener("change", motionListener);
      container?.destroy();
    };
  }, []);

  return <div id="gryphon-particles" className="particle-background" aria-hidden="true" />;
}
