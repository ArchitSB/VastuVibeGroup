import { getMediaAsset, type MediaKey } from "@/lib/media";
import { cn } from "@/lib/utils";

type MediaPictureProps = {
  assetKey: MediaKey;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  loading?: "eager" | "lazy";
};

export function MediaPicture({
  assetKey,
  className,
  imageClassName,
  sizes = "(max-width: 760px) 92vw, 48vw",
  loading = "lazy",
}: MediaPictureProps) {
  const asset = getMediaAsset(assetKey);

  return (
    <picture
      className={cn("media-picture", asset.transparent && "media-picture--transparent", className)}
      style={asset.blurDataURL ? { backgroundImage: `url(${asset.blurDataURL})` } : undefined}
    >
      {asset.avifSet ? <source type="image/avif" srcSet={asset.avifSet} /> : null}
      {asset.webpSet ? <source type="image/webp" srcSet={asset.webpSet} /> : null}
      <img
        className={imageClassName}
        src={asset.jpg}
        srcSet={asset.jpgSet || undefined}
        sizes={asset.jpgSet ? sizes : undefined}
        alt={asset.alt}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
}
