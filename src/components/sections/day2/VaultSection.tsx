"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TiltedCard from "@/components/ui/TiltedCard";
import { BoxCarousel } from "@/components/ui/originkit/BoxCarousel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { getMediaAsset, type MediaKey } from "@/lib/media";
import { motionTheme } from "@/lib/motion-theme";
import { residences, whatsappHref } from "@/content/home";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const boxItems = residences.map((residence) => ({
  id: residence.index,
  image: residence.assetKey as MediaKey,
  label: `${residence.name}. ${residence.line}`,
}));

export function VaultSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = residences[activeIndex];

  useGSAP(
    () => {
      const root = rootRef.current;
      const pin = root?.querySelector<HTMLElement>(".vault__pin");
      if (!root || !pin) return;
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const trigger = ScrollTrigger.create({
            trigger: root,
            pin,
            start: "top top",
            end: `+=${motionTheme.day2.vaultScrollLength}`,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const next = Math.min(residences.length - 1, Math.round(self.progress * (residences.length - 1)));
              setActiveIndex((current) => (current === next ? current : next));
            },
          });
          return () => trigger.kill();
        },
      );
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section id="residences" ref={rootRef} className="vault" aria-labelledby="vault-heading">
      <div className="vault__pin">
        <div className="vault__header">
          <SectionEyebrow text="CURATED DUBAI RESIDENCES" />
          <h2 id="vault-heading">Homes for lives lived beyond borders.</h2>
        </div>

        <div className="vault__desktop">
          <div className="vault__copy" aria-live="polite">
            <span className="vault__index">{active.index}</span>
            <div className="vault__copy-swap" key={active.index}>
              <h3>{active.name}</h3>
              <p>{active.line}</p>
              <MagneticButton
                className="button--ghost vault__enquire"
                href={whatsappHref(`Hello VastuVibe Group, I'd like to enquire about ${active.name}.`)}
                target="_blank"
                rel="noreferrer"
              >
                Enquire <span aria-hidden="true">↗</span>
              </MagneticButton>
            </div>
          </div>
          <div className="vault__stage">
            <span className="vault__glow" aria-hidden="true" />
            <BoxCarousel
              items={boxItems}
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
            />
          </div>
        </div>

        <div className="vault__mobile" aria-label="Swipe through residences">
          {residences.map((residence) => {
            const asset = getMediaAsset(residence.assetKey as MediaKey);
            return (
              <article className="vault-mobile-card" key={residence.index}>
                <TiltedCard
                  imageSrc={asset.jpg}
                  altText={asset.alt}
                  containerHeight="62svh"
                  imageHeight="62svh"
                  imageWidth="82vw"
                  rotateAmplitude={motionTheme.day2.tanzaniaTilt}
                  scaleOnHover={motionTheme.day2.imageHoverScale}
                  showMobileWarning={false}
                  showTooltip={false}
                />
                <div className="vault-mobile-card__copy">
                  <span>{residence.index}</span>
                  <h3>{residence.name}</h3>
                  <p>{residence.line}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
