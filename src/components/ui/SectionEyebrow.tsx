import ShinyText from "@/components/ui/ShinyText";
import { cn } from "@/lib/utils";

export function SectionEyebrow({ text, className }: { text: string; className?: string }) {
  return (
    <p className={cn("eyebrow section-eyebrow", className)}>
      <ShinyText
        text={text}
        speed={6}
        color="#c9a96a"
        shineColor="#f3eee4"
        spread={110}
      />
    </p>
  );
}
