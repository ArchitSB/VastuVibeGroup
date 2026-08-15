import logo from "../../../public/media/logo/logo-manifest.json";
import { cn } from "@/lib/utils";
import { VVMonogram } from "@/components/brand/VVMonogram";

/* eslint-disable @next/next/no-img-element -- source is a locally preprocessed transparent brand mark */

type LogoMarkProps = {
  className?: string;
  size?: 64 | 128 | 256 | 512;
  priority?: boolean;
};

export function LogoMark({ className, size = 128, priority = false }: LogoMarkProps) {
  if (!logo.available) {
    return <VVMonogram className={cn("logo-mark logo-mark--fallback", className)} />;
  }

  return (
    <img
      className={cn("logo-mark", className)}
      src={logo.marks[String(size) as keyof typeof logo.marks]}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
