"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MediaPicture } from "@/components/media/MediaPicture";
import { motionTheme } from "@/lib/motion-theme";
import type { MediaKey } from "@/lib/media";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ParallaxMediaProps = {
  assetKey: MediaKey;
  className?: string;
  sizes?: string;
};

export function ParallaxMedia({ assetKey, className, sizes }: ParallaxMediaProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const frame = frameRef.current;
      const image = frame?.querySelector("img");
      if (!frame || !image) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.fromTo(
        frame,
        { opacity: 0, y: reduced ? 0 : motionTheme.day2.sectionOffset },
        {
          opacity: 1,
          y: 0,
          duration: reduced ? motionTheme.duration.instant : motionTheme.duration.sectionReveal,
          ease: motionTheme.ease.out,
          scrollTrigger: { trigger: frame, start: "top 88%", once: true },
        },
      );

      if (!reduced) {
        gsap.fromTo(
          image,
          { yPercent: -motionTheme.day2.imageParallaxPercent / 2 },
          {
            yPercent: motionTheme.day2.imageParallaxPercent / 2,
            ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }
    },
    { scope: frameRef },
  );

  return (
    <div ref={frameRef} className={cn("parallax-media", className)}>
      <MediaPicture assetKey={assetKey} sizes={sizes} />
    </div>
  );
}
