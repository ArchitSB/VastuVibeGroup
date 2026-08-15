"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TiltedCard from "@/components/ui/TiltedCard";
import SplitText from "@/components/ui/SplitText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { getMediaAsset } from "@/lib/media";
import { motionTheme } from "@/lib/motion-theme";
import { whatsappHref } from "@/content/home";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const coast = getMediaAsset("dar-coast");
const city = getMediaAsset("city-teal");

export function TanzaniaSection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const wash = root?.querySelector<HTMLElement>(".tanzania__wash");
      if (!root || !wash) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const targets = root.querySelectorAll<HTMLElement>("[data-tanzania-enter]");
      gsap.fromTo(
        targets,
        { opacity: 0, y: reduced ? 0 : motionTheme.day2.sectionOffset },
        {
          opacity: 1,
          y: 0,
          duration: reduced ? motionTheme.duration.instant : motionTheme.duration.sectionReveal,
          stagger: reduced ? 0 : motionTheme.stagger.relaxed,
          ease: motionTheme.ease.out,
          scrollTrigger: { trigger: root, start: "top 72%", once: true },
        },
      );
      if (!reduced) {
        gsap
          .timeline({
            scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
          })
          .fromTo(wash, { opacity: 0 }, { opacity: 1, duration: 0.44, ease: "none" })
          .to(wash, { opacity: 0, duration: 0.56, ease: "none" });
      } else {
        gsap.set(wash, { opacity: 1 });
      }
    },
    { scope: rootRef },
  );

  return (
    <section id="tanzania" ref={rootRef} className="tanzania day2-section" aria-label="Rooted in Tanzania">
      <span className="tanzania__wash" aria-hidden="true" />
      <div className="tanzania__copy" data-tanzania-enter>
        <SectionEyebrow text="ROOTED IN TANZANIA" className="tanzania__eyebrow" />
        <SplitText
          text="Global ambition, rooted at home."
          tag="h2"
          splitType="lines"
          className="tanzania__heading"
          textAlign="left"
        />
        <p>
          Alongside our Dubai portfolio, VastuVibe is building a considered local practice — land, homes and
          advisory for clients across Tanzania. One team, one standard, both markets.
        </p>
        <div className="tanzania__chips" aria-label="Local services">
          <span>Land</span><span>Homes</span><span>Advisory</span>
        </div>
        <MagneticButton
          className="button--ghost tanzania__cta"
          href={whatsappHref("Hello VastuVibe Group, I'd like to talk about property in Tanzania.")}
          target="_blank"
          rel="noreferrer"
        >
          Talk to us about Tanzania <span aria-hidden="true">↗</span>
        </MagneticButton>
      </div>

      <div className="tanzania__cards" data-tanzania-enter>
        <div className="tanzania-card tanzania-card--coast">
          <TiltedCard
            imageSrc={coast.jpg}
            altText={coast.alt}
            containerHeight="100%"
            imageHeight="100%"
            imageWidth="100%"
            rotateAmplitude={motionTheme.day2.tanzaniaTilt}
            scaleOnHover={motionTheme.day2.imageHoverScale}
            showMobileWarning={false}
            showTooltip={false}
          />
        </div>
        <div className="tanzania-card tanzania-card--city">
          <TiltedCard
            imageSrc={city.jpg}
            altText={city.alt}
            containerHeight="100%"
            imageHeight="100%"
            imageWidth="100%"
            rotateAmplitude={motionTheme.day2.tanzaniaTilt}
            scaleOnHover={motionTheme.day2.imageHoverScale}
            showMobileWarning={false}
            showTooltip={false}
          />
        </div>
      </div>
    </section>
  );
}
