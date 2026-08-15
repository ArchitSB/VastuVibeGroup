import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mediaDir = join(root, "public", "media");
const rawDir = join(mediaDir, "raw");
const processedDir = join(mediaDir, "processed");
const cutoutPath = join(mediaDir, "cutouts", "tower-hero.png");
const glowPath = join(mediaDir, "cutouts", "tower-hero-glow.png");
const reportDir = join(mediaDir, "reports");
const widths = [640, 1280, 2000];

const assets = [
  {
    key: "skyline-dubai",
    file: "skyline-dubai.jpg",
    alt: "Dubai skyline illuminated at night",
    profile: "warm",
    sourcePage: "https://www.pexels.com/photo/aerial-view-of-dubai-skyline-at-night-36738857/",
    sourceUrl: "https://images.pexels.com/photos/36738857/pexels-photo-36738857.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    key: "lagoon-aerial",
    file: "lagoon-aerial.jpg",
    alt: "Luxury residences over a turquoise lagoon",
    profile: "warm",
    sourcePage: "https://www.pexels.com/photo/overwater-villa-in-tropical-maldives-lagoon-28843967/",
    sourceUrl: "https://images.pexels.com/photos/28843967/pexels-photo-28843967.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    key: "marina-night",
    file: "marina-night.jpg",
    alt: "Dubai Marina towers reflected in the water at night",
    profile: "warm",
    sourcePage: "https://www.pexels.com/photo/marina-in-dubai-at-night-16533792/",
    sourceUrl: "https://images.pexels.com/photos/16533792/pexels-photo-16533792.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    key: "villas-dusk",
    file: "villas-dusk.jpg",
    alt: "Contemporary luxury villa and pool at dusk",
    profile: "warm",
    sourcePage: "https://www.pexels.com/photo/luxurious-villa-with-pool-at-dusk-35060260/",
    sourceUrl: "https://images.pexels.com/photos/35060260/pexels-photo-35060260.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    key: "interior-night",
    file: "interior-night.jpg",
    alt: "Luxury apartment interior with a panoramic evening view",
    profile: "warm",
    sourcePage: "https://www.pexels.com/photo/spacious-living-room-with-panoramic-windows-in-evening-time-7045915/",
    sourceUrl: "https://images.pexels.com/photos/7045915/pexels-photo-7045915.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    key: "dar-coast",
    file: "dar-coast.jpg",
    alt: "Dar es Salaam coastline at dusk",
    profile: "teal",
    sourcePage: "https://www.pexels.com/photo/sunset-above-calm-sea-water-13344624/",
    sourceUrl: "https://images.pexels.com/photos/13344624/pexels-photo-13344624.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    key: "city-teal",
    file: "city-teal.jpg",
    alt: "Downtown Dar es Salaam viewed from above at sunset",
    profile: "teal",
    sourcePage: "https://unsplash.com/photos/U-aYAp5OpEo",
    sourceUrl: "https://images.unsplash.com/photo-1709719263441-583d78ced547?auto=format&fit=crop&fm=jpg&q=86&w=3000",
  },
];

const warmMatrix = [
  [1.04, 0.015, 0],
  [0.005, 0.975, 0],
  [0, 0.01, 0.92],
];

const tealMatrix = [
  [0.88, 0.035, 0],
  [0, 0.99, 0.035],
  [0, 0.055, 1.08],
];

function grade(input, profile) {
  return sharp(input)
    .rotate()
    .modulate({ brightness: 0.9, saturation: 0.82 })
    .linear(1.08, -8)
    .recomb(profile === "teal" ? tealMatrix : warmMatrix);
}

await Promise.all([mkdir(processedDir, { recursive: true }), mkdir(reportDir, { recursive: true })]);

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  note: "All paths are local. Swap source files and rerun pnpm process:images; components remain unchanged.",
  assets: {},
  cutouts: {},
};

for (const asset of assets) {
  const source = join(rawDir, asset.file);
  const metadata = await sharp(source).metadata();
  const blurBuffer = await grade(source, asset.profile).resize({ width: 24 }).jpeg({ quality: 38 }).toBuffer();
  const variants = {};

  for (const width of widths) {
    const outputWidth = Math.min(width, metadata.width ?? width);
    const baseName = `${asset.key}-${outputWidth}`;
    const targetBase = join(processedDir, baseName);

    const [avifInfo, webpInfo, jpgInfo] = await Promise.all([
      grade(source, asset.profile)
        .resize({ width: outputWidth, withoutEnlargement: true })
        .avif({ quality: 58, effort: 5 })
        .toFile(`${targetBase}.avif`),
      grade(source, asset.profile)
        .resize({ width: outputWidth, withoutEnlargement: true })
        .webp({ quality: 78, effort: 5 })
        .toFile(`${targetBase}.webp`),
      grade(source, asset.profile)
        .resize({ width: outputWidth, withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(`${targetBase}.jpg`),
    ]);

    variants[outputWidth] = {
      width: jpgInfo.width,
      height: jpgInfo.height,
      avif: `/media/processed/${baseName}.avif`,
      webp: `/media/processed/${baseName}.webp`,
      jpg: `/media/processed/${baseName}.jpg`,
      bytes: { avif: avifInfo.size, webp: webpInfo.size, jpg: jpgInfo.size },
    };
  }

  manifest.assets[asset.key] = {
    alt: asset.alt,
    raw: `/media/raw/${asset.file}`,
    sourcePage: asset.sourcePage,
    sourceUrl: asset.sourceUrl,
    tonalProfile: asset.profile,
    blurDataURL: `data:image/jpeg;base64,${blurBuffer.toString("base64")}`,
    variants,
  };

  console.log(`processed ${asset.key}`);
}

// Tighten the rembg canvas while preserving a small transparent atmosphere.
const trimmedPath = `${cutoutPath}.trimmed.png`;
const cutoutInfo = await sharp(cutoutPath)
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })
  .extend({ top: 28, bottom: 28, left: 28, right: 28, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ height: 2400, withoutEnlargement: true })
  .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true, colours: 256, dither: 0.55, effort: 10 })
  .toFile(trimmedPath);
await rename(trimmedPath, cutoutPath);

const cutoutBuffer = await readFile(cutoutPath);
await sharp(cutoutBuffer)
  .tint("#E8CFA0")
  .blur(12)
  .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true, colours: 128, dither: 0.45, effort: 10 })
  .toFile(glowPath);
const cutoutComposite = await sharp(cutoutBuffer).resize({ height: 900, withoutEnlargement: true }).png().toBuffer();
await sharp({
  create: { width: 1600, height: 1000, channels: 3, background: "#0B0B0F" },
})
  .composite([{ input: cutoutComposite, gravity: "south" }])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(join(reportDir, "tower-cutout-obsidian.jpg"));

manifest.cutouts["tower-hero"] = {
  alt: "Burj Khalifa tower cut out against transparency",
  png: "/media/cutouts/tower-hero.png",
  glow: "/media/cutouts/tower-hero-glow.png",
  width: cutoutInfo.width,
  height: cutoutInfo.height,
  sourcePage: "https://www.pexels.com/photo/illuminated-skyscraper-at-dusk-8494888/",
  sourceUrl: "https://images.pexels.com/photos/8494888/pexels-photo-8494888.jpeg?auto=compress&cs=tinysrgb&w=2400",
  edgeInspection: "/media/reports/tower-cutout-obsidian.jpg",
};

await writeFile(join(mediaDir, "media.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log("wrote public/media/media.json and tower edge-inspection composite");
