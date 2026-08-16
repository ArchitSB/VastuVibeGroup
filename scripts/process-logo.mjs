import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const logoDir = join(process.cwd(), "public", "media", "logo");
const source = join(logoDir, "vastuvibe-mark.png");

try {
  await access(source);
} catch {
  throw new Error(
    "Missing public/media/logo/vastuvibe-mark.png. Add the supplied transparent gold mark and rerun pnpm process:logo.",
  );
}

await mkdir(logoDir, { recursive: true });
const trimmed = sharp(source).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } });
const marks = [64, 128, 256, 512];
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

await Promise.all(
  marks.map((size) =>
    trimmed
      .clone()
      .resize(size, size, { fit: "contain", withoutEnlargement: false, background: transparent })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(join(logoDir, `vastuvibe-mark-${size}.png`)),
  ),
);

await Promise.all([
  trimmed.clone().resize(32, 32, { fit: "contain", background: transparent }).png().toFile(join(logoDir, "favicon-32.png")),
  trimmed.clone().resize(180, 180, { fit: "contain", background: transparent }).png().toFile(join(logoDir, "apple-touch-icon-180.png")),
  trimmed.clone().resize(512, 512, { fit: "contain", background: transparent }).png().toFile(join(logoDir, "favicon-512.png")),
]);

const manifest = {
  available: true,
  source: "/media/logo/vastuvibe-mark.png",
  marks: Object.fromEntries(marks.map((size) => [String(size), `/media/logo/vastuvibe-mark-${size}.png`])),
  icons: {
    favicon: "/media/logo/favicon-32.png",
    apple: "/media/logo/apple-touch-icon-180.png",
    large: "/media/logo/favicon-512.png",
  },
};

await writeFile(join(logoDir, "logo-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log("Processed VastuVibe logo marks and favicon set.");
