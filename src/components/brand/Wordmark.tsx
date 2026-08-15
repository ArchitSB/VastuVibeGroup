import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoMark";

type WordmarkProps = {
  className?: string;
  compact?: boolean;
  monogramOnly?: boolean;
};

export function Wordmark({ className, compact = false, monogramOnly = false }: WordmarkProps) {
  return (
    <span className={cn("wordmark", compact && "wordmark--compact", className)}>
      <LogoMark className="wordmark__monogram" size={compact ? 64 : 128} priority={compact} />
      {!monogramOnly && (
        <span className="wordmark__type" aria-label="VastuVibe">
          <span>Vastu</span>
          <em>Vibe</em>
          <span className="wordmark__dot" aria-hidden="true">
            .
          </span>
        </span>
      )}
    </span>
  );
}
