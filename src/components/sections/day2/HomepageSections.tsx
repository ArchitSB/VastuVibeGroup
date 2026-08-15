import { TrustMarquee } from "@/components/sections/day2/TrustMarquee";
import { StatementSection } from "@/components/sections/day2/StatementSection";
import { VaultSection } from "@/components/sections/day2/VaultSection";
import { DealSection } from "@/components/sections/day2/DealSection";
import { SpotlightSection } from "@/components/sections/day2/SpotlightSection";
import { TanzaniaSection } from "@/components/sections/day2/TanzaniaSection";
import { JourneySection } from "@/components/sections/day2/JourneySection";
import { FounderNoteSection } from "@/components/sections/day2/FounderNoteSection";
import { ClosingCtaSection } from "@/components/sections/day2/ClosingCtaSection";

export function HomepageSections() {
  return (
    <div className="page-surface page-surface--day2">
      <TrustMarquee />
      <StatementSection />
      <VaultSection />
      <DealSection />
      <SpotlightSection />
      <TanzaniaSection />
      <JourneySection />
      <FounderNoteSection />
      <ClosingCtaSection />
    </div>
  );
}
