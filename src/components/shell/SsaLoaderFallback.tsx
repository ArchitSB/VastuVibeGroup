"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { LogoMark } from "@/components/brand/LogoMark";
import { motionTheme } from "@/lib/motion-theme";

type SsaLoaderFallbackProps = {
  onComplete: () => void;
  reduced?: boolean;
};

export function SsaLoaderFallback({ onComplete, reduced = false }: SsaLoaderFallbackProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<SVGSVGElement>(null);
  const firstLineRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const firstLine = firstLineRef.current;
    const dot = dotRef.current;
    const glow = glowRef.current;
    const logo = logoRef.current;
    const caption = captionRef.current;
    if (!root || !stage || !firstLine || !dot || !glow || !logo || !caption) return;

    const theme = motionTheme.ssaLoader;
    const choreography = theme.timeline;
    const paths = Array.from(stage.querySelectorAll<SVGPathElement>("[data-draw]"));
    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: reduced ? 0 : length });
    });
    gsap.set(logo, { autoAlpha: 0, scale: reduced ? 1 : theme.identityStartScale, transformOrigin: "50% 50%" });
    gsap.set(caption, { autoAlpha: 0, y: theme.captionOffset });
    gsap.set(dot, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" });
    gsap.set(glow, {
      autoAlpha: 0,
      scale: choreography.dotGlowFallbackStartScale,
      transformOrigin: "50% 50%",
    });
    gsap.set(stage, { scale: reduced ? 1 : theme.fallbackStartScale, transformOrigin: "50% 50%" });

    const timeline = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete,
    });

    if (reduced) {
      root.dataset.phase = "reduced";
      timeline
        .to(stage, { autoAlpha: 0, duration: theme.reduced.drawingExitDuration }, theme.reduced.drawingExitAt)
        .to(logo, { autoAlpha: 1, duration: theme.reduced.logoDuration }, theme.reduced.logoAt)
        .to(caption, { autoAlpha: 1, y: 0, duration: theme.reduced.captionDuration }, theme.reduced.captionAt)
        .to({}, { duration: theme.reduced.holdDuration })
        .to([logo, caption, root], { autoAlpha: 0, duration: theme.reduced.exitDuration });
      return;
    }

    const drawGroup = (selector: string, at: number, duration: number, stagger: number) => {
      timeline.to(selector, {
        strokeDashoffset: 0,
        duration,
        stagger,
        ease: "power1.inOut",
      }, at);
    };

    const firstLineLength = firstLine.getTotalLength();
    const pen = { progress: 0 };
    root.dataset.phase = "dot";
    timeline
      .to(dot, {
        autoAlpha: 1,
        scale: 1,
        duration: choreography.dotDuration,
        ease: "back.out(2.4)",
      }, choreography.dotAt)
      .to(dot, {
        opacity: choreography.dotDimOpacity,
        duration: choreography.dotBlinkDuration,
        repeat: choreography.dotBlinkRepeat,
        yoyo: true,
        ease: "sine.inOut",
      }, choreography.dotBlinkAt)
      .to(glow, {
        autoAlpha: choreography.dotGlowPeakOpacity,
        scale: choreography.dotGlowFallbackEndScale,
        duration: choreography.dotGlowInDuration,
        ease: "power2.out",
      }, choreography.dotGlowAt)
      .to(glow, {
        autoAlpha: 0,
        duration: choreography.dotGlowFadeDuration,
        ease: "power2.in",
      }, choreography.dotGlowFadeAt)
      .to(stage, {
        scale: 1,
        duration: choreography.foundationCameraDuration,
        ease: "power3.inOut",
      }, choreography.firstLineAt)
      .to(firstLine, {
        strokeDashoffset: 0,
        duration: choreography.firstLineDuration,
        ease: "power1.inOut",
        onStart: () => {
          root.dataset.phase = "building";
        },
      }, choreography.firstLineAt)
      .to(pen, {
        progress: 1,
        duration: choreography.firstLineDuration,
        ease: "power1.inOut",
        onUpdate: () => {
          const current = firstLine.getPointAtLength(firstLineLength * pen.progress);
          dot.setAttribute("cx", String(current.x));
          dot.setAttribute("cy", String(current.y));
        },
      }, choreography.firstLineAt)
      .to(dot, { scale: 0.82, duration: choreography.dotSettleDuration }, choreography.firstLineAt)
      .to(dot, { autoAlpha: 0, duration: choreography.dotExitDuration }, choreography.dotExitAt);

    drawGroup("[data-stage='foundation']", choreography.squareAt, choreography.squareDuration, choreography.squareStagger);
    drawGroup("[data-stage='room']", choreography.firstRoomAt, 0.62, 0.08);
    drawGroup("[data-stage='detail']", choreography.firstDetailsAt, 0.26, 0.035);
    drawGroup("[data-stage='wing']", choreography.secondRoomAt, 0.38, 0.075);
    drawGroup("[data-stage='upper']", choreography.upperFloorAt, 0.28, 0.028);
    drawGroup("[data-stage='accent']", choreography.accentsAt, 0.24, 0.025);
    drawGroup("[data-stage='roof']", choreography.roofAt, 0.24, 0.028);
    drawGroup("[data-stage='roof-detail']", choreography.roofDetailsAt, 0.2, 0.022);

    timeline
      .to(stage, {
        rotateY: theme.fallbackOrbitDegrees,
        duration: choreography.orbitDuration,
        ease: "sine.inOut",
      }, choreography.orbitAt)
      .to(stage, {
        autoAlpha: 0,
        scale: theme.buildingExitScale,
        duration: choreography.canvasExitDuration,
      }, choreography.identityAt)
      .to(logo, {
        autoAlpha: 1,
        scale: 1,
        duration: choreography.logoEnterDuration,
        ease: "back.out(1.8)",
        onStart: () => {
          root.dataset.phase = "identity";
        },
      }, choreography.logoAt)
      .to(caption, {
        autoAlpha: 1,
        y: 0,
        duration: choreography.captionEnterDuration,
      }, choreography.captionAt)
      .to({}, { duration: choreography.identityHoldDuration })
      .to([logo, caption], {
        autoAlpha: 0,
        scale: theme.identityExitScale,
        duration: choreography.identityExitDuration,
      })
      .to(root, { autoAlpha: 0, duration: choreography.overlayExitDuration }, "<");
  }, { scope: rootRef, dependencies: [onComplete, reduced], revertOnUpdate: true });

  return (
    <div className="ssa-loader ssa-loader--fallback" ref={rootRef}>
      <div className="ssa-loader__film" aria-hidden="true" />
      <svg
        ref={stageRef}
        className="ssa-loader__fallback-drawing"
        viewBox="0 0 520 340"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ssa-loader-dot-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.92" />
            <stop offset="24%" stopColor="white" stopOpacity="0.42" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="ssa-loader__fallback-building">
          <path ref={firstLineRef} data-draw d="M80 280 L260 280" />

          <path data-draw data-stage="foundation" d="M260 280 L310 250" />
          <path data-draw data-stage="foundation" d="M310 250 L130 250" />
          <path data-draw data-stage="foundation" d="M130 250 L80 280" />

          <path data-draw data-stage="room" d="M80 280 L80 214 M260 280 L260 214 M310 250 L310 184 M130 250 L130 184" />
          <path data-draw data-stage="room" d="M80 214 L260 214 L310 184 L130 184 Z" />
          <path data-draw data-stage="room" d="M260 214 L310 184 L310 250 L260 280 Z" />

          <path data-draw data-stage="detail" d="M100 232 H145 V266 H100 Z M166 232 H235 V266 H166 Z" />
          <path data-draw data-stage="detail" d="M272 220 L296 205 V238 L272 253 Z" />
          <path data-draw data-stage="detail" d="M122 232 V266 M202 232 V266 M100 246 H145 M166 246 H235" />

          <path data-draw data-stage="wing" d="M260 280 H430 L470 256 H310" />
          <path data-draw data-stage="wing" d="M430 280 V214 L470 190 V256 M260 214 H430 L470 190 H310" />
          <path data-draw data-stage="wing" d="M284 232 H336 V266 H284 Z M354 232 H408 V266 H354 Z" />

          <path data-draw data-stage="upper" d="M92 214 V154 M260 214 V154 M430 214 V154 M310 184 V124 M470 190 V130" />
          <path data-draw data-stage="upper" d="M92 154 H260 L310 124 H470 L430 154 H260" />
          <path data-draw data-stage="upper" d="M116 170 H168 V200 H116 Z M190 170 H240 V200 H190 Z M286 154 H344 V190 H286 Z M366 154 H416 V190 H366 Z" />

          <path data-draw data-stage="accent" d="M150 150 V136 H350 V150 M170 136 V150 M236 136 V150 M302 136 V150" />
          <path data-draw data-stage="accent" d="M335 215 V188 H415 V215 M335 188 L365 170 H445 L415 188" />

          <path data-draw data-stage="roof" d="M72 154 L278 82 L476 130" />
          <path data-draw data-stage="roof" d="M92 154 L286 98 L456 138" />
          <path data-draw data-stage="roof" d="M72 154 L92 154 M278 82 L286 98 M476 130 L456 138" />
          <path data-draw data-stage="roof-detail" d="M160 123 L170 132 M230 98 L240 111 M348 99 L340 111 M412 115 L402 125" />
          <circle
            ref={glowRef}
            className="ssa-loader__fallback-glow"
            cx="80"
            cy="280"
            r="18"
            fill="url(#ssa-loader-dot-glow)"
          />
          <circle
            ref={dotRef}
            className="ssa-loader__fallback-pen"
            cx="80"
            cy="280"
            r={motionTheme.ssaLoader.timeline.dotRadiusFallback}
          />
        </g>
      </svg>

      <div className="ssa-loader__logo-wrap" ref={logoRef}>
        <LogoMark className="ssa-loader__logo" size={512} priority />
      </div>
      <p className="ssa-loader__caption" ref={captionRef}>
        VastuVibe Group <span>Limited</span>
      </p>
    </div>
  );
}
