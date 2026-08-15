"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { motionTheme } from "@/lib/motion-theme";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type MagneticButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

export function MagneticButton({ className, children, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;
      const eligible =
        window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
      if (!eligible) return;

      const xTo = gsap.quickTo(element, "x", {
        duration: motionTheme.day2.magneticEase,
        ease: motionTheme.ease.out,
      });
      const yTo = gsap.quickTo(element, "y", {
        duration: motionTheme.day2.magneticEase,
        ease: motionTheme.ease.out,
      });

      const move = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        xTo(gsap.utils.clamp(-1, 1, dx) * motionTheme.day2.magneticAttraction);
        yTo(gsap.utils.clamp(-1, 1, dy) * motionTheme.day2.magneticAttraction);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerleave", leave);
      return () => {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );

  return (
    <a ref={ref} className={cn("button magnetic-button", className)} {...props}>
      <span className="magnetic-button__shine" aria-hidden="true" />
      <span className="magnetic-button__label">{children}</span>
    </a>
  );
}
