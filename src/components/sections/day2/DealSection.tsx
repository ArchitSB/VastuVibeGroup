import CountUp from "@/components/ui/CountUp";
import SplitText from "@/components/ui/SplitText";
import { AnimeRule } from "@/components/ui/AnimeRule";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { dealStats } from "@/content/home";
import { motionTheme } from "@/lib/motion-theme";

export function DealSection() {
  return (
    <section id="deal" className="deal day2-section" aria-label="The deal">
      <div className="deal__header">
        <SectionEyebrow text="THE DEAL" />
        <SplitText
          text="Numbers that open doors."
          tag="h2"
          splitType="lines"
          className="deal__heading"
          textAlign="left"
        />
      </div>
      <div className="deal__stats">
        {dealStats.map((stat, index) => (
          <article className="deal-stat" key={stat.label}>
            {index > 0 ? <AnimeRule axis="y" className="deal-stat__rule" /> : null}
            <p className="deal-stat__value">
              {stat.from > 0 ? (
                <>
                  <CountUp to={stat.from} />
                  <span>–</span>
                </>
              ) : null}
              <CountUp to={stat.to} delay={index * motionTheme.stagger.base} />
              <span>{stat.suffix}</span>
            </p>
            <p className="deal-stat__label">{stat.label}</p>
          </article>
        ))}
      </div>
      <p className="deal__microcopy">
        Limited-period offer. Terms apply — speak with our team for current availability.
      </p>
    </section>
  );
}
