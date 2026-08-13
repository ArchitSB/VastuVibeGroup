"use client";

import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionTheme } from "@/lib/motion-theme";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type SceneProps = {
  active: boolean;
  progress: { current: number };
  onReady: () => void;
};

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

export function RisingTowerRuntime() {
  const progressRef = useRef(0);
  const [introReady, setIntroReady] = useState(false);
  const [webglEligible, setWebglEligible] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [sceneActive, setSceneActive] = useState(true);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);

  useEffect(() => {
    const ready = () => setIntroReady(true);
    if (document.documentElement.dataset.siteReady === "true") ready();
    else window.addEventListener("vastuvibe:ready", ready, { once: true });
    return () => window.removeEventListener("vastuvibe:ready", ready);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 4;
    const eligible = desktop && !reduced && memory >= 4;
    setWebglEligible(eligible);

    if (!eligible) return;
    let disposed = false;
    let loading = false;
    const loadScene = () => {
      if (loading || disposed) return;
      loading = true;
      void import("@/components/three/RisingTowerScene").then((module) => {
        if (!disposed) setScene(() => module.RisingTowerScene);
      });
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.isTrusted && Math.abs(event.movementX) + Math.abs(event.movementY) > 0) loadScene();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("wheel", loadScene, { once: true, passive: true });
    window.addEventListener("pointerdown", loadScene, { once: true, passive: true });
    return () => {
      disposed = true;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("wheel", loadScene);
      window.removeEventListener("pointerdown", loadScene);
    };
  }, []);

  useEffect(() => {
    const root = document.getElementById("top");
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSceneActive(entry.isIntersecting && document.visibilityState === "visible"),
      { rootMargin: "20% 0px" },
    );
    const onVisibility = () => {
      const bounds = root.getBoundingClientRect();
      setSceneActive(document.visibilityState === "visible" && bounds.bottom > 0 && bounds.top < window.innerHeight);
    };
    observer.observe(root);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const tower = document.getElementById("hero-tower-dom");
    tower?.classList.toggle("hero__tower-dom--hidden", webglReady);
    return () => tower?.classList.remove("hero__tower-dom--hidden");
  }, [webglReady]);

  useGSAP(
    () => {
      const root = document.getElementById("top");
      const tower = document.getElementById("hero-tower-dom");
      const copy = document.getElementById("hero-copy");
      if (!root || !tower || !copy) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const introLayers = copy.querySelectorAll("[data-hero-copy]");
      const scrollLayers = copy.querySelectorAll(".hero__heading, [data-hero-copy]");

      if (introReady && !coarse) {
        gsap.fromTo(
          introLayers,
          { opacity: 0 },
          {
            opacity: 1,
            duration: reduced ? motionTheme.duration.instant : motionTheme.duration.reveal,
            stagger: reduced ? 0 : motionTheme.stagger.relaxed,
            ease: motionTheme.ease.out,
          },
        );
      } else if (introReady) gsap.set(introLayers, { opacity: 1 });

      if (reduced) {
        gsap.set(tower, { opacity: 1 });
        return;
      }

      if (desktop && webglEligible) {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: `+=${motionTheme.hero.desktopScrollLength}`,
            pin: true,
            pinSpacing: false,
            scrub: motionTheme.hero.scrub,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progressRef.current = self.progress;
            },
          },
        });
        timeline.to(scrollLayers, {
          y: motionTheme.hero.textLift,
          opacity: 0,
          duration: 0.48,
          stagger: motionTheme.stagger.tight,
        }, 0.12);
        return;
      }

      gsap.fromTo(
        tower,
        { scale: 1, y: 0 },
        {
          scale: motionTheme.hero.mobileScaleEnd,
          y: motionTheme.hero.mobileTowerTravel,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: motionTheme.hero.scrub,
          },
        },
      );
    },
    { dependencies: [introReady, webglEligible], revertOnUpdate: true },
  );

  if (!Scene || !webglEligible) return null;

  return (
    <div className={`hero__webgl ${webglReady ? "hero__webgl--ready" : ""}`} aria-hidden="true">
      <Scene active={sceneActive} progress={progressRef} onReady={() => setWebglReady(true)} />
    </div>
  );
}
