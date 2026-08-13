"use client";

import { useEffect, useState } from "react";
import SplitText from "@/components/ui/SplitText";
import { motionTheme } from "@/lib/motion-theme";

export function DesktopHeroHeading() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onReady = () => {
      setReady(document.documentElement.dataset.siteReadyReason !== "watchdog");
    };
    if (document.documentElement.dataset.siteReady === "true") onReady();
    else window.addEventListener("vastuvibe:ready", onReady, { once: true });
    return () => window.removeEventListener("vastuvibe:ready", onReady);
  }, []);

  return (
    <SplitText
      tag="h1"
      text="Dubai's finest addresses, delivered in Tanzania."
      splitType="lines"
      delay={motionTheme.stagger.base * 1000}
      from={{ y: motionTheme.hero.revealOffset }}
      to={{ y: 0 }}
      ready={ready}
      className="hero__heading hero__heading--desktop"
      textAlign="left"
    >
      Dubai&apos;s finest addresses, <em>delivered</em> in Tanzania.
    </SplitText>
  );
}

