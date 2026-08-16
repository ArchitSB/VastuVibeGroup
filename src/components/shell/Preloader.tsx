"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SsaLoaderFallback } from "@/components/shell/SsaLoaderFallback";

type LoaderMode = "pending" | "desktop" | "fallback" | "reduced";
type ReadyReason = "animated" | "instant" | "watchdog";

const DesktopSsaLoader = dynamic(
  () => import("@/components/three/SsaLoaderScene").then((module) => module.SsaLoaderScene),
  { ssr: false, loading: () => null },
);

function signalReady(reason: ReadyReason) {
  document.documentElement.dataset.siteReady = "true";
  document.documentElement.dataset.siteReadyReason = reason;
  delete document.documentElement.dataset.preloader;
  window.dispatchEvent(new Event("vastuvibe:ready"));
}

export function Preloader() {
  const [mode, setMode] = useState<LoaderMode>("pending");
  const [visible, setVisible] = useState(true);
  const completedRef = useRef(false);

  const finish = useCallback((reason: ReadyReason = "animated") => {
    if (completedRef.current) return;
    completedRef.current = true;
    setVisible(false);
    signalReady(reason);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.siteReady = "false";
    document.documentElement.dataset.siteReadyReason = "pending";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setMode("reduced");
    } else {
      const finePointer = window.matchMedia("(pointer: fine)").matches;
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
      setMode(window.innerWidth >= 1024 && finePointer && memory >= 4 ? "desktop" : "fallback");
    }

    const handleWatchdog = () => {
      if (document.documentElement.dataset.siteReadyReason === "watchdog") finish("watchdog");
    };
    window.addEventListener("vastuvibe:ready", handleWatchdog);
    return () => window.removeEventListener("vastuvibe:ready", handleWatchdog);
  }, [finish]);

  if (!visible) return null;

  return (
    <div
      className="preloader"
      role="status"
      aria-label="VastuVibe Group is loading"
      aria-live="polite"
      aria-busy="true"
    >
      {mode === "pending" && <div className="ssa-loader ssa-loader--pending" aria-hidden="true" />}
      {mode === "desktop" && (
        <DesktopSsaLoader
          onComplete={() => finish("animated")}
          onUnavailable={() => setMode("fallback")}
        />
      )}
      {mode === "fallback" && <SsaLoaderFallback onComplete={() => finish("animated")} />}
      {mode === "reduced" && <SsaLoaderFallback reduced onComplete={() => finish("instant")} />}
    </div>
  );
}
