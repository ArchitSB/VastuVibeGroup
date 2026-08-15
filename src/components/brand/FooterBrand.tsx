"use client";

import type { ComponentType } from "react";
import { useState } from "react";
import { LogoMark } from "@/components/brand/LogoMark";

type ShinyComponent = ComponentType<{
  text: string;
  disabled?: boolean;
  speed?: number;
  color?: string;
  shineColor?: string;
}>;

export function FooterBrand() {
  const [hovered, setHovered] = useState(false);
  const [ShinyText, setShinyText] = useState<ShinyComponent | null>(null);

  function beginShimmer() {
    setHovered(true);
    if (!ShinyText) {
      import("@/components/ui/ShinyText").then((module) => setShinyText(() => module.default));
    }
  }

  function renderText(text: string, color = "#f3eee4", shineColor = "#e8cfa0") {
    if (!ShinyText) return text;
    return <ShinyText text={text} disabled={!hovered} speed={6} color={color} shineColor={shineColor} />;
  }

  return (
    <div
      className="footer-brand"
      onPointerEnter={beginShimmer}
      onPointerLeave={() => setHovered(false)}
      onFocus={beginShimmer}
      onBlur={() => setHovered(false)}
    >
      <LogoMark className="footer-brand__mark" size={256} />
      <span className="footer-brand__type" aria-label="VastuVibe">
        {renderText("Vastu")}
        <em>{renderText("Vibe")}</em>
        {renderText(".", "#c9a96a", "#f3eee4")}
      </span>
    </div>
  );
}
