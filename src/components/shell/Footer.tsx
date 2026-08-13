import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

const links = [
  ["Residences", "#residences"],
  ["The Deal", "#deal"],
  ["Tanzania", "#tanzania"],
  ["Contact", "#contact"],
] as const;

export function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="site-footer__topline" />
      <div className="site-footer__grid">
        <Wordmark className="site-footer__brand" />
        <div className="site-footer__contact">
          <p className="eyebrow">Start a private conversation</p>
          <a href="tel:+255789113131">+255 789 113 131</a>
          <a href="mailto:info@vastuvibegroup.com">info@vastuvibegroup.com</a>
          <span>Dar es Salaam, Tanzania</span>
        </div>
        <nav className="site-footer__nav" aria-label="Footer navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="site-footer__socials" aria-label="Social links">
          <a href="#" aria-label="Instagram placeholder">IG</a>
          <a href="#" aria-label="LinkedIn placeholder">LI</a>
          <a href="#" aria-label="Facebook placeholder">FB</a>
        </div>
      </div>
      <p className="site-footer__legal">
        © 2026 VastuVibe Group Limited. Independent sales partner. Project imagery courtesy of DAMAC Properties.
      </p>
    </footer>
  );
}

