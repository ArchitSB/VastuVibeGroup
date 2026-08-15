import SplitText from "@/components/ui/SplitText";
import { AnimeRule } from "@/components/ui/AnimeRule";
import { founderNote } from "@/content/home";

export function FounderNoteSection() {
  return (
    <section className="founder-note day2-section" aria-label="Founder's note">
      <span className="founder-note__quote" aria-hidden="true">“</span>
      <SplitText
        text={founderNote.quote}
        tag="p"
        splitType="lines"
        className="founder-note__text"
        textAlign="left"
      />
      <div className="founder-note__attribution">
        <span>{founderNote.attribution}</span>
        <AnimeRule />
      </div>
    </section>
  );
}
