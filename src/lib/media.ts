import media from "../../public/media/media.json";

export type MediaAssetKey = keyof typeof media.assets;
export type MediaKey = MediaAssetKey | "tower-hero";

export function getMediaAsset(key: MediaKey) {
  if (key === "tower-hero") {
    return {
      alt: media.cutouts["tower-hero"].alt,
      blurDataURL: "",
      jpg: media.cutouts["tower-hero"].png,
      avifSet: "",
      webpSet: "",
      jpgSet: "",
      transparent: true,
    } as const;
  }

  const asset = media.assets[key];
  const widths = ["640", "1280", "2000"] as const;
  return {
    alt: asset.alt,
    blurDataURL: asset.blurDataURL,
    jpg: asset.variants["1280"].jpg,
    avifSet: widths.map((width) => `${asset.variants[width].avif} ${width}w`).join(", "),
    webpSet: widths.map((width) => `${asset.variants[width].webp} ${width}w`).join(", "),
    jpgSet: widths.map((width) => `${asset.variants[width].jpg} ${width}w`).join(", "),
    transparent: false,
  } as const;
}

export function getWebGLSource(key: MediaAssetKey) {
  return media.assets[key].variants["1280"].webp;
}
