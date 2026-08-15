"use client";

import type { ComponentType } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MediaPicture } from "@/components/media/MediaPicture";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { getWebGLSource, type MediaAssetKey } from "@/lib/media";
import { motionTheme } from "@/lib/motion-theme";
import { spotlightSlides } from "@/content/home";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type WebGLScene = ComponentType<{
  urls: readonly string[];
  activeIndex: number;
  onUnavailable?: () => void;
}>;
const webglUrls = spotlightSlides.map((slide) => getWebGLSource(slide.assetKey as MediaAssetKey));
const amenities = ["Private beach", "Sky lounge", "Concierge", "Marina berth"];

function isWebGLEligible() {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  return (
    window.matchMedia("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)")
      .matches && memory >= 4
  );
}

export function SpotlightSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [Scene, setScene] = useState<WebGLScene | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const handleWebGLUnavailable = useCallback(() => setWebglUnavailable(true), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && isWebGLEligible() && !Scene && !webglUnavailable) {
          import("@/components/three/GradientSpotlightScene").then((module) => setScene(() => module.default));
        }
      },
      { rootMargin: "20% 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [Scene, webglUnavailable]);

  useEffect(() => {
    if (!inView) return;
    const timeout = window.setTimeout(
      () => setActiveIndex((current) => (current + 1) % spotlightSlides.length),
      motionTheme.day2.spotlightAutoAdvanceMs,
    );
    return () => window.clearTimeout(timeout);
  }, [activeIndex, inView]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pin = root?.querySelector<HTMLElement>(".spotlight__pin");
      if (!root || !pin) return;
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const trigger = ScrollTrigger.create({
            trigger: root,
            pin,
            start: "top top",
            end: `+=${motionTheme.day2.spotlightScrollLength}`,
            scrub: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const next = Math.min(
                spotlightSlides.length - 1,
                Math.floor(self.progress * spotlightSlides.length),
              );
              setActiveIndex((current) => (current === next ? current : next));
              gsap.to(root.querySelectorAll<HTMLElement>("[data-depth]"), {
                yPercent: (index) => self.progress * Number(index + 1) * -8,
                duration: motionTheme.duration.instant,
                overwrite: true,
              });
            },
          });
          return () => trigger.kill();
        },
      );
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="spotlight" aria-labelledby="spotlight-heading">
      <div className="spotlight__pin">
        <div className="spotlight__images" aria-hidden="true">
          {spotlightSlides.map((slide, index) => (
            <MediaPicture
              key={slide.assetKey}
              assetKey={slide.assetKey as MediaAssetKey}
              className={index === activeIndex ? "is-active" : ""}
              sizes="100vw"
            />
          ))}
          {Scene && inView && !webglUnavailable && isWebGLEligible() ? (
            <Scene
              urls={webglUrls}
              activeIndex={activeIndex}
              onUnavailable={handleWebGLUnavailable}
            />
          ) : null}
          <span className="spotlight__shade" />
        </div>

        <div className="spotlight__header">
          <SectionEyebrow text="ONE ADDRESS, CONSIDERED" />
          <h2 id="spotlight-heading">Where the skyline becomes home.</h2>
        </div>

        <div className="spotlight__amenities" aria-label="Featured amenities">
          {amenities.map((amenity, index) => (
            <span key={amenity} data-depth={index + 1}>
              {amenity}
            </span>
          ))}
        </div>

        <div className="spotlight__captions" aria-live="polite">
          {spotlightSlides.map((slide, index) => (
            <div key={slide.kicker} className={index === activeIndex ? "is-active" : ""}>
              <span>{slide.kicker}</span>
              <p>{slide.caption}</p>
            </div>
          ))}
        </div>

        <div className="spotlight__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${(activeIndex + 1) / spotlightSlides.length})` }} />
        </div>
      </div>
    </section>
  );
}
