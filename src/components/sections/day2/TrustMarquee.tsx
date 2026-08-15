"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { LogoMark } from "@/components/brand/LogoMark";
import { trustMarquee } from "@/content/home";
import { motionTheme } from "@/lib/motion-theme";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function MarqueeGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="trust-marquee__group" aria-hidden={hidden || undefined}>
      {trustMarquee.map((phrase) => (
        <span className="trust-marquee__phrase" key={phrase}>
          <span>{phrase}</span>
          <LogoMark className="trust-marquee__mark" size={64} />
        </span>
      ))}
    </div>
  );
}

export function TrustMarquee() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = root?.querySelector<HTMLElement>(".trust-marquee__track");
      if (!root || !track) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: motionTheme.duration.instant });
        return;
      }

      let loop: gsap.core.Tween | undefined;
      const buildLoop = () => {
        loop?.kill();
        const distance = track.scrollWidth / 2;
        gsap.set(track, { x: 0 });
        loop = gsap.to(track, {
          x: -distance,
          duration: distance / motionTheme.day2.marqueeBasePixelsPerSecond,
          repeat: -1,
          ease: "none",
        });
      };
      buildLoop();

      const velocityTrigger = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (!loop) return;
          const target = gsap.utils.clamp(
            1,
            motionTheme.day2.marqueeMaxScale,
            1 + Math.abs(self.getVelocity()) * motionTheme.day2.marqueeVelocityInfluence,
          );
          loop.timeScale(target);
          gsap.to(loop, {
            timeScale: 1,
            duration: motionTheme.duration.marqueeSettle,
            ease: motionTheme.ease.out,
            overwrite: true,
          });
        },
      });
      const resizeObserver = new ResizeObserver(buildLoop);
      resizeObserver.observe(track);

      return () => {
        resizeObserver.disconnect();
        velocityTrigger.kill();
        loop?.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="trust-marquee" aria-label="VastuVibe credentials">
      <div className="trust-marquee__track">
        <MarqueeGroup />
        <MarqueeGroup hidden />
      </div>
    </section>
  );
}
