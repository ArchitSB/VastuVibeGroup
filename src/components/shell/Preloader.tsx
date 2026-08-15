"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createTimeline } from "animejs";
import { motionTheme } from "@/lib/motion-theme";
import { LogoMark } from "@/components/brand/LogoMark";

const storageKey = "vastuvibe-intro-seen";

function signalReady(reason: "animated" | "instant" | "watchdog" = "animated") {
  document.documentElement.dataset.siteReady = "true";
  document.documentElement.dataset.siteReadyReason = reason;
  delete document.documentElement.dataset.preloader;
  window.dispatchEvent(new Event("vastuvibe:ready"));
}

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const root = rootRef.current;
    const counter = counterRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.sessionStorage.getItem(storageKey) === "true";
    const watchdogFinished = document.documentElement.dataset.siteReady === "true";

    if (!root || !counter || reduced || seen || watchdogFinished) {
      setVisible(false);
      const reason = watchdogFinished ? "watchdog" : "instant";
      requestAnimationFrame(() => signalReady(reason));
      return;
    }

    document.documentElement.dataset.siteReady = "false";
    const totalMs = motionTheme.duration.preloader * 1000;
    const countState = { value: 0 };
    const timeline = createTimeline({
      autoplay: true,
      onComplete: () => {
        window.sessionStorage.setItem(storageKey, "true");
        setVisible(false);
        signalReady();
      },
    });

    timeline.add(
      root.querySelectorAll(".preloader__mark"),
      {
        opacity: [0, 1],
        scale: [motionTheme.day2.logoStartScale, 1],
        duration: totalMs * 0.48,
        ease: "out(4)",
      },
      0,
    );
    timeline.add(
      root.querySelectorAll(".preloader__shine"),
      {
        translateX: ["-160%", "160%"],
        duration: totalMs * 0.42,
        ease: "inOut(3)",
      },
      totalMs * 0.12,
    );
    timeline.add(
      countState,
      {
        value: 100,
        duration: totalMs * 0.62,
        ease: "out(3)",
        onUpdate: () => {
          counter.textContent = String(Math.round(countState.value)).padStart(2, "0");
        },
      },
      0,
    );
    timeline.add(
      root.querySelectorAll("[data-curtain='left']"),
      {
        translateX: "-101%",
        duration: totalMs * 0.38,
        ease: "inOut(4)",
      },
      totalMs * 0.62,
    );
    timeline.add(
      root.querySelectorAll("[data-curtain='right']"),
      {
        translateX: "101%",
        duration: totalMs * 0.38,
        ease: "inOut(4)",
      },
      totalMs * 0.62,
    );
    animate(root.querySelectorAll("[data-preloader-content]"), {
      opacity: [1, 0],
      duration: totalMs * 0.18,
      delay: totalMs * 0.58,
      ease: "in(2)",
    });

    return () => {
      timeline.revert();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="preloader"
      aria-label="Loading VastuVibe Group"
      aria-live="polite"
    >
      <div className="preloader__curtain preloader__curtain--left" data-curtain="left" />
      <div className="preloader__curtain preloader__curtain--right" data-curtain="right" />
      <div className="preloader__content" data-preloader-content>
        <span className="preloader__logo-mask">
          <LogoMark className="preloader__mark" size={256} priority />
          <span className="preloader__shine" aria-hidden="true" />
        </span>
        <span ref={counterRef} className="preloader__counter">
          00
        </span>
      </div>
    </div>
  );
}
