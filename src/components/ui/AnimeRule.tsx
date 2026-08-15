"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { motionTheme } from "@/lib/motion-theme";
import { cn } from "@/lib/utils";

export function AnimeRule({ axis = "x", className }: { axis?: "x" | "y"; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        animate(element, {
          opacity: [0, 1],
          scaleX: axis === "x" ? [0, 1] : 1,
          scaleY: axis === "y" ? [0, 1] : 1,
          duration: (reduced ? motionTheme.duration.instant : motionTheme.duration.lineDraw) * 1000,
          ease: "out(4)",
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [axis]);

  return <span ref={ref} aria-hidden="true" className={cn("anime-rule", `anime-rule--${axis}`, className)} />;
}
