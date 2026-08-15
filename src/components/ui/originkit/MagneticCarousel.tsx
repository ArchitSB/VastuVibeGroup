"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { motionTheme } from "@/lib/motion-theme";

gsap.registerPlugin(useGSAP);

export function MagneticCarousel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !window.matchMedia("(pointer: fine)").matches) return;
      const track = root.firstElementChild;
      if (!track) return;
      const xTo = gsap.quickTo(track, "x", {
        duration: motionTheme.day2.magneticEase,
        ease: motionTheme.ease.out,
      });
      const move = (event: PointerEvent) => {
        const rect = root.getBoundingClientRect();
        const normalized = (event.clientX - rect.left) / rect.width - 0.5;
        xTo(normalized * motionTheme.day2.magneticAttraction);
      };
      const leave = () => xTo(0);
      root.addEventListener("pointermove", move);
      root.addEventListener("pointerleave", leave);
      return () => {
        root.removeEventListener("pointermove", move);
        root.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="magnetic-carousel">
      <div className="magnetic-carousel__track">{children}</div>
    </div>
  );
}
