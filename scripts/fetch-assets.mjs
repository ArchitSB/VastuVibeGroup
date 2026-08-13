import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = join(root, "public", "media", "raw");

// Direct, original-source image URLs. The accompanying source page is kept here
// for editorial traceability while the fetch URL makes the pipeline repeatable.
const assets = [
  {
    file: "tower-hero.jpg",
    sourcePage: "https://www.pexels.com/photo/illuminated-skyscraper-at-dusk-8494888/",
    url: "https://images.pexels.com/photos/8494888/pexels-photo-8494888.jpeg?auto=compress&cs=tinysrgb&w=2400",
  },
  {
    file: "skyline-dubai.jpg",
    sourcePage: "https://www.pexels.com/photo/aerial-view-of-dubai-skyline-at-night-36738857/",
    url: "https://images.pexels.com/photos/36738857/pexels-photo-36738857.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    file: "lagoon-aerial.jpg",
    sourcePage: "https://www.pexels.com/photo/overwater-villa-in-tropical-maldives-lagoon-28843967/",
    url: "https://images.pexels.com/photos/28843967/pexels-photo-28843967.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    file: "marina-night.jpg",
    sourcePage: "https://www.pexels.com/photo/marina-in-dubai-at-night-16533792/",
    url: "https://images.pexels.com/photos/16533792/pexels-photo-16533792.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    file: "villas-dusk.jpg",
    sourcePage: "https://www.pexels.com/photo/luxurious-villa-with-pool-at-dusk-35060260/",
    url: "https://images.pexels.com/photos/35060260/pexels-photo-35060260.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    file: "interior-night.jpg",
    sourcePage: "https://www.pexels.com/photo/spacious-living-room-with-panoramic-windows-in-evening-time-7045915/",
    url: "https://images.pexels.com/photos/7045915/pexels-photo-7045915.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    file: "dar-coast.jpg",
    sourcePage: "https://www.pexels.com/photo/sunset-above-calm-sea-water-13344624/",
    url: "https://images.pexels.com/photos/13344624/pexels-photo-13344624.jpeg?auto=compress&cs=tinysrgb&w=3000",
  },
  {
    file: "city-teal.jpg",
    sourcePage: "https://unsplash.com/photos/U-aYAp5OpEo",
    url: "https://images.unsplash.com/photo-1709719263441-583d78ced547?auto=format&fit=crop&fm=jpg&q=86&w=3000",
  },
];

await mkdir(outputDir, { recursive: true });

for (const asset of assets) {
  const response = await fetch(asset.url, {
    headers: { "User-Agent": "VastuVibe local asset pipeline/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Failed ${asset.file}: ${response.status} ${response.statusText}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(join(outputDir, asset.file), bytes);
  console.log(`${asset.file.padEnd(22)} ${(bytes.length / 1024 / 1024).toFixed(2)} MB`);
}

console.log(`Fetched ${assets.length} licensed source images into ${outputDir}`);
