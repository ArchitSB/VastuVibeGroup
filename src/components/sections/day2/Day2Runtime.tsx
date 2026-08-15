"use client";

import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";

export function Day2Runtime() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [Sections, setSections] = useState<ComponentType | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || Sections) return;
    let cancelled = false;
    let started = false;
    const loadSections = () => {
      if (started) return;
      started = true;
      observer.disconnect();
      window.removeEventListener("scroll", onApproach);
      import("@/components/sections/day2/HomepageSections").then((module) => {
        if (cancelled) return;
        setSections(() => module.HomepageSections);
        requestAnimationFrame(() => requestAnimationFrame(() => window.dispatchEvent(new Event("resize"))));
      });
    };
    const onApproach = () => {
      if (host.getBoundingClientRect().top <= window.innerHeight * 1.15) loadSections();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        loadSections();
      },
      { rootMargin: "0px 0px 15% 0px", threshold: 0 },
    );
    observer.observe(host);
    window.addEventListener("scroll", onApproach, { passive: true });
    onApproach();
    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("scroll", onApproach);
    };
  }, [Sections]);

  return (
    <div ref={hostRef} className="day2-runtime" aria-busy={!Sections}>
      {Sections ? <Sections /> : null}
    </div>
  );
}
