"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MediaPicture } from "@/components/media/MediaPicture";
import type { MediaKey } from "@/lib/media";
import { motionTheme } from "@/lib/motion-theme";

export type BoxCarouselItem = {
  id: string;
  image: MediaKey;
  label: string;
};

type BoxCarouselProps = {
  items: readonly BoxCarouselItem[];
  activeIndex: number;
  onActiveIndexChange?: (index: number) => void;
};

export function BoxCarousel({ items, activeIndex, onActiveIndexChange }: BoxCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, pointerX: 0, index: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const faces = gsap.utils.toArray<HTMLElement>(".box-carousel__face", root);
    const relativeIndex = (index: number) => {
      let delta = index - activeIndex;
      if (delta > items.length / 2) delta -= items.length;
      if (delta < -items.length / 2) delta += items.length;
      return delta;
    };
    const tween = gsap.to(faces, {
      rotateY: (index) => relativeIndex(index) * motionTheme.day2.vaultFaceAngle,
      xPercent: (index) => relativeIndex(index) * motionTheme.day2.vaultFaceOffsetPercent,
      z: (index) => -Math.abs(relativeIndex(index)) * motionTheme.day2.vaultFaceDepth,
      opacity: (index) => (index === activeIndex ? 1 : 0),
      duration: reduced ? motionTheme.duration.instant : motionTheme.duration.ui,
      ease: motionTheme.ease.inOut,
      overwrite: true,
    });
    return () => {
      tween.kill();
    };
  }, [activeIndex, items.length]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      pointerX: event.clientX,
      index: activeIndex,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    const rotation =
      (dragRef.current.pointerX - event.clientX) * motionTheme.day2.vaultDragSensitivity;
    const rawIndex = dragRef.current.index + Math.round(rotation / motionTheme.day2.vaultFaceAngle);
    onActiveIndexChange?.(gsap.utils.wrap(0, items.length, rawIndex));
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      ref={rootRef}
      className="box-carousel"
      style={{ perspective: `${motionTheme.day2.vaultPerspective}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-roledescription="carousel"
      aria-label="Curated Dubai residences"
    >
      <div className="box-carousel__rotor">
        {items.map((item, index) => (
          <article
            key={item.id}
            className={`box-carousel__face ${index === activeIndex ? "is-active" : ""}`}
            aria-hidden={index !== activeIndex}
          >
            <MediaPicture assetKey={item.image} sizes="(min-width: 1024px) 52vw, 90vw" />
            <span className="box-carousel__veil" aria-hidden="true" />
            <span className="box-carousel__beam" aria-hidden="true" />
            <span className="sr-only">{item.label}</span>
          </article>
        ))}
      </div>
      <span className="box-carousel__drag-hint" aria-hidden="true">
        Drag / Scroll
      </span>
    </div>
  );
}
