/* eslint-disable @next/next/no-img-element -- the hero uses a preprocessed transparent cutout, not an optimizable photo */

import { DesktopHeroHeading } from "@/components/sections/DesktopHeroHeading";
import { RisingTowerRuntime } from "@/components/sections/RisingTowerRuntime";

const whatsapp =
  "https://wa.me/255789113131?text=Hello%20VastuVibe%20Group%2C%20I%27m%20interested%20in%20Dubai%20properties.";

export function RisingTowerHero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-heading">
      <div className="hero__atmosphere" aria-hidden="true">
        <span />
        <span />
      </div>

      <RisingTowerRuntime />

      <div id="hero-tower-dom" className="hero__tower-dom" aria-hidden="true">
        <img
          className="hero__tower-image"
          src="/media/cutouts/tower-hero.png"
          alt=""
          decoding="async"
          fetchPriority="low"
        />
        <span className="hero__tower-glow" />
      </div>

      <div id="hero-copy" className="hero__copy">
        <p className="eyebrow hero__eyebrow" data-hero-copy>
          VastuVibe Group · Dar es Salaam
        </p>
        <div className="hero__heading-wrap">
          <h1 id="hero-heading" className="hero__heading hero__heading--mobile">
            Dubai&apos;s finest addresses, <em>delivered</em> in Tanzania.
          </h1>
          <DesktopHeroHeading />
        </div>
        <p className="hero__credential" data-hero-copy>
          Official sales partner — DAMAC Properties, Dubai
        </p>
        <div className="hero__actions" data-hero-copy>
          <a className="button button--primary" href="#residences">
            Explore Residences <span aria-hidden="true">↓</span>
          </a>
          <a className="button button--outline" href={whatsapp} target="_blank" rel="noreferrer">
            Book a Private Consultation
          </a>
        </div>
      </div>

      <div className="hero__scroll-cue" aria-hidden="true">
        <span>Scroll to discover</span>
        <i />
      </div>
    </section>
  );
}
