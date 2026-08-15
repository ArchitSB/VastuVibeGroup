import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".agents/**",
      ".next/**",
      ".pnpm-store/**",
      ".venv/**",
      "next-env.d.ts",
      "out/**",
      "reference/**",
      "public/media/**",
    ],
  },
];

export default eslintConfig;
