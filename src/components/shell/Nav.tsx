"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { motionTheme } from "@/lib/motion-theme";
import { Wordmark } from "@/components/brand/Wordmark";
import { MagneticButton } from "@/components/ui/MagneticButton";

gsap.registerPlugin(useGSAP);

const links = [
  { href: "#residences", label: "Residences" },
  { href: "#deal", label: "The Deal" },
  { href: "#tanzania", label: "Tanzania" },
  { href: "#contact", label: "Contact" },
];

const whatsapp =
  "https://wa.me/255789113131?text=Hello%20VastuVibe%20Group%2C%20I%27m%20interested%20in%20Dubai%20properties.";

export function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    return () => document.documentElement.classList.remove("menu-open");
  }, [open]);

  useGSAP(
    () => {
      if (!overlayRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const panel = overlayRef.current;
      const items = panel.querySelectorAll("[data-menu-item]");

      if (open) {
        panel.hidden = false;
        const timeline = gsap.timeline();
        timeline.fromTo(
          panel,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: reduced ? motionTheme.duration.instant : motionTheme.duration.ui },
        );
        timeline.fromTo(
          items,
          reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: reduced ? motionTheme.duration.instant : motionTheme.duration.ui,
            ease: motionTheme.ease.out,
            stagger: reduced ? 0 : motionTheme.stagger.base,
          },
          reduced ? 0 : "-=0.18",
        );
      } else if (!panel.hidden) {
        gsap.to(panel, {
          autoAlpha: 0,
          duration: reduced ? motionTheme.duration.instant : motionTheme.duration.ui,
          onComplete: () => {
            panel.hidden = true;
          },
        });
      }
    },
    { dependencies: [open], scope: navRef },
  );

  return (
    <header ref={navRef} className={`site-nav ${scrolled ? "site-nav--scrolled" : ""}`}>
      <div className="site-nav__inner">
        <Link href="#top" aria-label="VastuVibe Group home" className="site-nav__brand">
          <Wordmark compact />
        </Link>

        <nav className="site-nav__desktop" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <MagneticButton className="button--outline button--nav" href={whatsapp} target="_blank" rel="noreferrer">
            Book a Consultation
          </MagneticButton>
        </nav>

        <button
          className={`menu-toggle ${open ? "menu-toggle--open" : ""}`}
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-navigation" ref={overlayRef} className="mobile-menu" hidden>
        <nav aria-label="Mobile navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} data-menu-item onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <a href={whatsapp} target="_blank" rel="noreferrer" data-menu-item onClick={() => setOpen(false)}>
            Book a private consultation <span aria-hidden="true">↗</span>
          </a>
        </nav>
        <p data-menu-item>Dar es Salaam · Tanzania</p>
      </div>
    </header>
  );
}
