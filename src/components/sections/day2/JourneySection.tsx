"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { journeySteps } from "@/content/home";
import { motionTheme } from "@/lib/motion-theme";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function JourneySection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pin = root?.querySelector<HTMLElement>(".journey__pin");
      const track = root?.querySelector<HTMLElement>(".journey__track");
      const line = root?.querySelector<HTMLElement>(".journey__progress-line");
      if (!root || !pin || !track || !line) return;
      const media = gsap.matchMedia();

      media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const travel = () => Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * 0.1);
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            pin,
            start: "top top",
            end: `+=${motionTheme.day2.journeyScrollLength}`,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        timeline.to(track, { x: () => -travel(), ease: "none" }, 0);
        timeline.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
        return () => timeline.kill();
      });

      media.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".journey-card", root);
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: track, start: "top 76%", end: "bottom 35%", scrub: true },
          },
        );
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0, x: motionTheme.day2.sectionOffset },
            {
              opacity: 1,
              x: 0,
              ease: motionTheme.ease.out,
              duration: motionTheme.duration.sectionReveal,
              scrollTrigger: { trigger: card, start: "top 82%", once: true },
            },
          );
        });
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          root.querySelectorAll(".journey-card"),
          { opacity: 0 },
          { opacity: 1, duration: motionTheme.duration.instant, stagger: motionTheme.stagger.tight },
        );
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="journey" aria-labelledby="journey-heading">
      <div className="journey__pin">
        <header className="journey__header">
          <SectionEyebrow text="THE JOURNEY" />
          <h2 id="journey-heading">From first conversation to keys in hand.</h2>
        </header>
        <div className="journey__track-wrap">
          <span className="journey__progress-line" aria-hidden="true" />
          <div className="journey__track">
            {journeySteps.map((step) => (
              <article className="journey-card" key={step.index}>
                <span className="journey-card__index">{step.index}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
                <span className="journey-card__orbit" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
