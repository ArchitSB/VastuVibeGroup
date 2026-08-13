"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motionTheme } from "@/lib/motion-theme";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches || !dotRef.current || !ringRef.current) return;

    document.documentElement.classList.add("custom-cursor-active");
    const dot = dotRef.current;
    const ring = ringRef.current;
    const dotX = gsap.quickTo(dot, "x", { duration: motionTheme.duration.instant, ease: motionTheme.ease.out });
    const dotY = gsap.quickTo(dot, "y", { duration: motionTheme.duration.instant, ease: motionTheme.ease.out });
    const ringX = gsap.quickTo(ring, "x", { duration: motionTheme.duration.ui, ease: motionTheme.ease.out });
    const ringY = gsap.quickTo(ring, "y", { duration: motionTheme.duration.ui, ease: motionTheme.ease.out });

    const move = (event: PointerEvent) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };
    const hover = (event: PointerEvent) => {
      const interactive = (event.target as Element | null)?.closest("a, button, [data-cursor-expand]");
      gsap.to(ring, {
        scale: interactive ? 1.75 : 1,
        opacity: interactive ? 0.8 : 0.48,
        duration: motionTheme.duration.instant,
      });
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", hover);
    document.addEventListener("pointerout", hover);
    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", hover);
      document.removeEventListener("pointerout", hover);
    };
  }, []);

  return (
    <div className="cursor-layer" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </div>
  );
}

