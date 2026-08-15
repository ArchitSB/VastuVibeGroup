import type { CSSProperties } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import SplitText from "@/components/ui/SplitText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { consultationHref } from "@/content/home";
import { motionTheme } from "@/lib/motion-theme";

type DotStyle = CSSProperties & {
  "--dot-x": string;
  "--dot-y": string;
  "--dot-delay": string;
  "--dot-size": string;
};

export function ClosingCtaSection() {
  const dots = Array.from({ length: motionTheme.day2.ctaDotCount }, (_, index) => ({
    "--dot-x": `${(index * 37 + 11) % 97}%`,
    "--dot-y": `${(index * 61 + 7) % 89}%`,
    "--dot-delay": `${-(index % 9) * 0.42}s`,
    "--dot-size": `${1 + (index % 3)}px`,
  })) as DotStyle[];

  return (
    <section className="closing-cta" aria-label="Contact invitation">
      <div className="closing-cta__dots" aria-hidden="true">
        {dots.map((style, index) => <span style={style} key={index} />)}
      </div>
      <LogoMark className="closing-cta__watermark" size={512} />
      <div className="closing-cta__copy">
        <SectionEyebrow text="VASTUVIBE PRIVATE OFFICE" />
        <SplitText
          text="Your next address begins with a conversation."
          tag="h2"
          splitType="lines"
          className="closing-cta__heading"
          textAlign="center"
        />
        <MagneticButton
          className="button--outline closing-cta__button"
          href={consultationHref}
          target="_blank"
          rel="noreferrer"
        >
          Speak with our Dar es Salaam team
        </MagneticButton>
      </div>
    </section>
  );
}
