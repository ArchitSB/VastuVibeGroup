import type { SVGProps } from "react";

type VVMonogramProps = SVGProps<SVGSVGElement> & {
  pathClassName?: string;
};

export function VVMonogram({ pathClassName, ...props }: VVMonogramProps) {
  return (
    <svg viewBox="0 0 42 32" aria-hidden="true" fill="none" {...props}>
      <path
        className={pathClassName}
        d="M2 3 13.6 29 25.2 3"
        pathLength="1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        className={pathClassName}
        d="M16.8 3 28.4 29 40 3"
        pathLength="1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

