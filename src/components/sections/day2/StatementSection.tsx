"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SplitText from "@/components/ui/SplitText";
import { AnimeRule } from "@/components/ui/AnimeRule";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { motionTheme } from "@/lib/motion-theme";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const support =
  "VastuVibe Group curates Dubai's most coveted addresses for buyers here at home — guided privately from our Dar es Salaam office, end to end.";

export function StatementSection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const words = gsap.utils.toArray<HTMLElement>(".statement__support-word", root);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.fromTo(words, { opacity: 0 }, { opacity: 1, duration: motionTheme.duration.instant });
        return;
      }
      gsap.to(words, {
        opacity: 1,
        stagger: motionTheme.stagger.tight,
        ease: "none",
        scrollTrigger: {
          trigger: root.querySelector(".statement__support"),
          start: "top 76%",
          end: "bottom 46%",
          scrub: true,
        },
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="statement day2-section" aria-label="VastuVibe statement">
      <SectionEyebrow text="A PRIVATE DOOR TO DUBAI" />
      <SplitText
        text="A Tanzanian company, opening the gates of Dubai."
        tag="h2"
        splitType="lines"
        className="statement__heading"
        textAlign="left"
      >
        A Tanzanian company, opening the <em>gates</em> of Dubai.
      </SplitText>
      <p className="statement__support">
        {support.split(" ").map((word, index) => (
          <span className="statement__support-word" key={`${word}-${index}`}>
            {word}{" "}
          </span>
        ))}
      </p>
      <AnimeRule className="statement__rule" />
    </section>
  );
}
