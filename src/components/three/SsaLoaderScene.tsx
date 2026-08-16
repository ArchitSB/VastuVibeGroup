"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import { LogoMark } from "@/components/brand/LogoMark";
import { motionTheme } from "@/lib/motion-theme";

type Edge = readonly [THREE.Vector3, THREE.Vector3];
type Disposable = { dispose: () => void };
type Segment = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  positions: Float32Array;
  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  progress: { value: number };
};

type SsaLoaderSceneProps = {
  onComplete: () => void;
  onUnavailable: () => void;
};

const point = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const boxEdges = (x1: number, x2: number, y1: number, y2: number, z1: number, z2: number): Edge[] => {
  const a = point(x1, y1, z1);
  const b = point(x2, y1, z1);
  const c = point(x2, y1, z2);
  const d = point(x1, y1, z2);
  const e = point(x1, y2, z1);
  const f = point(x2, y2, z1);
  const g = point(x2, y2, z2);
  const h = point(x1, y2, z2);

  return [
    [a, b], [b, c], [c, d], [d, a],
    [e, f], [f, g], [g, h], [h, e],
    [a, e], [b, f], [c, g], [d, h],
  ];
};

const frontFrame = (x1: number, x2: number, y1: number, y2: number, z: number, columns = 2): Edge[] => {
  const segments: Edge[] = [
    [point(x1, y1, z), point(x2, y1, z)],
    [point(x2, y1, z), point(x2, y2, z)],
    [point(x2, y2, z), point(x1, y2, z)],
    [point(x1, y2, z), point(x1, y1, z)],
  ];

  for (let index = 1; index < columns; index += 1) {
    const x = THREE.MathUtils.lerp(x1, x2, index / columns);
    segments.push([point(x, y1, z), point(x, y2, z)]);
  }

  const railY = THREE.MathUtils.lerp(y1, y2, 0.42);
  segments.push([point(x1, railY, z), point(x2, railY, z)]);
  return segments;
};

const sideFrame = (x: number, y1: number, y2: number, z1: number, z2: number, columns = 2): Edge[] => {
  const segments: Edge[] = [
    [point(x, y1, z1), point(x, y1, z2)],
    [point(x, y1, z2), point(x, y2, z2)],
    [point(x, y2, z2), point(x, y2, z1)],
    [point(x, y2, z1), point(x, y1, z1)],
  ];

  for (let index = 1; index < columns; index += 1) {
    const z = THREE.MathUtils.lerp(z1, z2, index / columns);
    segments.push([point(x, y1, z), point(x, y2, z)]);
  }

  return segments;
};

const balconyEdges = (x1: number, x2: number, y: number, frontZ: number, backZ: number): Edge[] => [
  [point(x1, y, backZ), point(x1, y, frontZ)],
  [point(x1, y, frontZ), point(x2, y, frontZ)],
  [point(x2, y, frontZ), point(x2, y, backZ)],
  [point(x1, y + 0.48, frontZ), point(x2, y + 0.48, frontZ)],
  [point(x1, y, frontZ), point(x1, y + 0.48, frontZ)],
  [point(x2, y, frontZ), point(x2, y + 0.48, frontZ)],
  [point(THREE.MathUtils.lerp(x1, x2, 0.33), y, frontZ), point(THREE.MathUtils.lerp(x1, x2, 0.33), y + 0.48, frontZ)],
  [point(THREE.MathUtils.lerp(x1, x2, 0.66), y, frontZ), point(THREE.MathUtils.lerp(x1, x2, 0.66), y + 0.48, frontZ)],
];

export function SsaLoaderScene({ onComplete, onUnavailable }: SsaLoaderSceneProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const onCompleteRef = useRef(onComplete);
  const onUnavailableRef = useRef(onUnavailable);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onUnavailableRef.current = onUnavailable;
  }, [onComplete, onUnavailable]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    const logo = logoRef.current;
    const caption = captionRef.current;
    if (!overlay || !canvas || !logo || !caption) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      onUnavailableRef.current();
      return;
    }

    const sceneTheme = motionTheme.ssaLoader;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, sceneTheme.maxDpr));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0c0c, sceneTheme.fogDensity);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.08, 100);
    const cameraState = { ...sceneTheme.camera.initial };

    const building = new THREE.Group();
    building.rotation.y = sceneTheme.buildingRotationStart;
    scene.add(building);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xf5f4ef,
      transparent: true,
      opacity: 0.9,
      depthTest: true,
    });
    const secondaryLineMaterial = new THREE.LineBasicMaterial({
      color: 0xcfd2ce,
      transparent: true,
      opacity: 0.64,
      depthTest: true,
    });

    const resources: Disposable[] = [lineMaterial, secondaryLineMaterial];
    const allSegments: Segment[] = [];

    const createSegment = ([start, end]: Edge, material = lineMaterial) => {
      const positions = new Float32Array([
        start.x, start.y, start.z,
        start.x, start.y, start.z,
      ]);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const line = new THREE.Line(geometry, material);
      line.visible = false;
      building.add(line);
      resources.push(geometry);

      const segment: Segment = {
        start,
        end,
        positions,
        line,
        progress: { value: 0 },
      };
      allSegments.push(segment);
      return segment;
    };

    const makeSegments = (edges: Edge[], material = lineMaterial) =>
      edges.map((edge) => createSegment(edge, material));

    const start = point(-1.4, 0, 1.2);
    const frontRight = point(1.4, 0, 1.2);
    const backRight = point(1.4, 0, -1.2);
    const backLeft = point(-1.4, 0, -1.2);

    const firstLine = createSegment([start, frontRight]);
    const square = makeSegments([
      [frontRight, backRight],
      [backRight, backLeft],
      [backLeft, start],
    ]);

    const firstRoom = makeSegments([
      [point(-1.4, 0, 1.2), point(-1.4, 1.5, 1.2)],
      [point(1.4, 0, 1.2), point(1.4, 1.5, 1.2)],
      [point(1.4, 0, -1.2), point(1.4, 1.5, -1.2)],
      [point(-1.4, 0, -1.2), point(-1.4, 1.5, -1.2)],
      ...boxEdges(-1.4, 1.4, 1.5, 1.5, -1.2, 1.2).slice(0, 4),
    ]);

    const firstRoomDetails = makeSegments([
      ...frontFrame(-1.08, 0.18, 0.34, 1.18, 1.215, 2),
      ...frontFrame(0.48, 1.16, 0.05, 1.2, 1.22, 1),
      ...sideFrame(1.415, 0.32, 1.2, -0.96, 0.86, 2),
    ], secondaryLineMaterial);

    const secondRoom = makeSegments([
      [point(1.4, 0, 1.2), point(4.2, 0, 1.2)],
      [point(4.2, 0, 1.2), point(4.2, 0, -1.2)],
      [point(4.2, 0, -1.2), point(1.4, 0, -1.2)],
      [point(4.2, 0, 1.2), point(4.2, 1.5, 1.2)],
      [point(4.2, 0, -1.2), point(4.2, 1.5, -1.2)],
      [point(1.4, 1.5, 1.2), point(4.2, 1.5, 1.2)],
      [point(4.2, 1.5, 1.2), point(4.2, 1.5, -1.2)],
      [point(4.2, 1.5, -1.2), point(1.4, 1.5, -1.2)],
    ]);

    const secondRoomDetails = makeSegments([
      ...frontFrame(1.72, 2.75, 0.34, 1.18, 1.215, 2),
      ...frontFrame(2.96, 3.88, 0.34, 1.18, 1.215, 2),
      ...sideFrame(4.215, 0.34, 1.18, -0.96, 0.96, 3),
    ], secondaryLineMaterial);

    const floorSpecs = [
      { x1: -1.35, x2: 4.15, y1: 1.5, y2: 2.7, z1: -1.16, z2: 1.32 },
    ];
    const upperFloors = floorSpecs.map((spec) => makeSegments(
      boxEdges(spec.x1, spec.x2, spec.y1, spec.y2, spec.z1, spec.z2),
    ));
    const upperDetails = floorSpecs.map((spec, index) => makeSegments([
      ...frontFrame(spec.x1 + 0.2, spec.x2 - 0.2, spec.y1 + 0.2, spec.y2 - 0.18, spec.z2 + 0.018, index === 2 ? 4 : 5),
      ...sideFrame(spec.x2 + 0.018, spec.y1 + 0.2, spec.y2 - 0.18, spec.z1 + 0.18, spec.z2 - 0.18, 3),
    ], secondaryLineMaterial));

    const houseAccents = makeSegments([
      ...balconyEdges(-0.55, 2.45, 2.72, 1.68, 1.28),
      [point(2.72, 1.16, 1.22), point(4.08, 1.16, 1.22)],
      [point(2.72, 1.16, 1.22), point(2.72, 1.16, 1.72)],
      [point(4.08, 1.16, 1.22), point(4.08, 1.16, 1.72)],
      [point(2.72, 1.16, 1.72), point(4.08, 1.16, 1.72)],
      [point(2.72, 0, 1.72), point(2.72, 1.16, 1.72)],
      [point(4.08, 0, 1.72), point(4.08, 1.16, 1.72)],
    ], secondaryLineMaterial);

    const roofFrame = makeSegments([
      [point(-1.55, 2.7, -1.34), point(4.35, 2.7, -1.34)],
      [point(-1.55, 2.7, 1.48), point(4.35, 2.7, 1.48)],
      [point(-1.55, 3.56, 0.07), point(4.35, 3.56, 0.07)],
      [point(-1.55, 2.7, -1.34), point(-1.55, 3.56, 0.07)],
      [point(-1.55, 3.56, 0.07), point(-1.55, 2.7, 1.48)],
      [point(4.35, 2.7, -1.34), point(4.35, 3.56, 0.07)],
      [point(4.35, 3.56, 0.07), point(4.35, 2.7, 1.48)],
    ]);
    const roofDetails = makeSegments([
      [point(-0.08, 2.7, -1.34), point(-0.08, 3.56, 0.07)],
      [point(-0.08, 3.56, 0.07), point(-0.08, 2.7, 1.48)],
      [point(1.4, 2.7, -1.34), point(1.4, 3.56, 0.07)],
      [point(1.4, 3.56, 0.07), point(1.4, 2.7, 1.48)],
      [point(2.88, 2.7, -1.34), point(2.88, 3.56, 0.07)],
      [point(2.88, 3.56, 0.07), point(2.88, 2.7, 1.48)],
    ], secondaryLineMaterial);

    const glassMeshes: Array<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>> = [];
    const slabMeshes: Array<THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>> = [];

    const createFrontGlass = (x1: number, x2: number, y1: number, y2: number, z: number) => {
      const geometry = new THREE.PlaneGeometry(x2 - x1, y2 - y1);
      const material = new THREE.MeshBasicMaterial({
        color: 0xc8d1cf,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, z);
      building.add(mesh);
      glassMeshes.push(mesh);
      resources.push(geometry, material);
      return mesh;
    };

    createFrontGlass(-1.08, 0.18, 0.34, 1.18, 1.2);
    createFrontGlass(1.72, 2.75, 0.34, 1.18, 1.2);
    createFrontGlass(2.96, 3.88, 0.34, 1.18, 1.2);
    floorSpecs.forEach((spec) => createFrontGlass(
      spec.x1 + 0.2,
      spec.x2 - 0.2,
      spec.y1 + 0.2,
      spec.y2 - 0.18,
      spec.z2,
    ));

    const createSlab = (spec: (typeof floorSpecs)[number]) => {
      const geometry = new THREE.BoxGeometry(spec.x2 - spec.x1, 0.055, spec.z2 - spec.z1);
      const material = new THREE.MeshBasicMaterial({
        color: 0xf4f3ed,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set((spec.x1 + spec.x2) / 2, spec.y1, (spec.z1 + spec.z2) / 2);
      building.add(mesh);
      slabMeshes.push(mesh);
      resources.push(geometry, material);
    };
    floorSpecs.forEach(createSlab);

    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const glowContext = glowCanvas.getContext("2d");
    if (glowContext) {
      const gradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.18, "rgba(255, 255, 255, 0.72)");
      gradient.addColorStop(0.48, "rgba(255, 255, 255, 0.2)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      glowContext.fillStyle = gradient;
      glowContext.fillRect(0, 0, glowCanvas.width, glowCanvas.height);
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    glowTexture.colorSpace = THREE.SRGBColorSpace;
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const drawingGlow = new THREE.Sprite(glowMaterial);
    const glowStartScale = sceneTheme.timeline.dotGlowDesktopStartScale;
    drawingGlow.position.copy(start);
    drawingGlow.scale.set(glowStartScale, glowStartScale, 1);
    drawingGlow.renderOrder = 9;
    building.add(drawingGlow);
    resources.push(glowTexture, glowMaterial);

    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.94 });
    const dotGeometry = new THREE.SphereGeometry(sceneTheme.timeline.dotRadiusDesktop, 24, 24);
    const drawingDot = new THREE.Mesh(dotGeometry, dotMaterial);
    drawingDot.position.copy(start);
    drawingDot.renderOrder = 10;
    building.add(drawingDot);
    resources.push(dotMaterial, dotGeometry);

    const drawSegment = (
      timeline: gsap.core.Timeline,
      segment: Segment,
      position: number,
      duration: number,
      followDot = false,
    ) => {
      timeline.to(segment.progress, {
        value: 1,
        duration,
        ease: "power1.inOut",
        onStart: () => {
          segment.line.visible = true;
        },
        onUpdate: () => {
          const progress = segment.progress.value;
          segment.positions[3] = THREE.MathUtils.lerp(segment.start.x, segment.end.x, progress);
          segment.positions[4] = THREE.MathUtils.lerp(segment.start.y, segment.end.y, progress);
          segment.positions[5] = THREE.MathUtils.lerp(segment.start.z, segment.end.z, progress);
          segment.line.geometry.attributes.position.needsUpdate = true;
          if (followDot) drawingDot.position.set(segment.positions[3], segment.positions[4], segment.positions[5]);
        },
      }, position);
    };

    const drawGroup = (
      timeline: gsap.core.Timeline,
      segments: Segment[],
      position: number,
      duration: number,
      stagger = 0.06,
    ) => {
      segments.forEach((segment, index) => {
        drawSegment(timeline, segment, position + index * stagger, duration);
      });
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = camera.aspect < 0.82 ? 56 : 42;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let animationFrame = 0;
    const clock = new THREE.Clock();
    const render = () => {
      const time = clock.getElapsedTime();
      const sway = cameraState.sway;
      camera.position.set(
        cameraState.x + Math.sin(time * 0.72) * sway,
        cameraState.y + Math.cos(time * 0.58) * sway * 0.7,
        cameraState.z + Math.sin(time * 0.43) * sway,
      );
      camera.lookAt(cameraState.tx, cameraState.ty, cameraState.tz);
      camera.rotation.z = cameraState.roll + Math.sin(time * 0.34) * sway * 0.08;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };
    render();

    const choreography = sceneTheme.timeline;
    const context = gsap.context(() => {
      gsap.set(logo, { autoAlpha: 0, scale: sceneTheme.identityStartScale, transformOrigin: "50% 50%" });
      gsap.set(caption, { autoAlpha: 0, y: sceneTheme.captionOffset });
      gsap.set(canvas, { autoAlpha: 1 });
      gsap.set(drawingDot.scale, { x: 0, y: 0, z: 0 });

      const timeline = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => onCompleteRef.current(),
      });

      timeline
        .to(drawingDot.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: choreography.dotDuration,
          ease: "back.out(2.4)",
        }, choreography.dotAt)
        .to(dotMaterial, {
          opacity: choreography.dotDimOpacity,
          duration: choreography.dotBlinkDuration,
          repeat: choreography.dotBlinkRepeat,
          yoyo: true,
          ease: "sine.inOut",
        }, choreography.dotBlinkAt)
        .to(glowMaterial, {
          opacity: choreography.dotGlowPeakOpacity,
          duration: choreography.dotGlowInDuration,
          ease: "power2.out",
        }, choreography.dotGlowAt)
        .to(drawingGlow.scale, {
          x: choreography.dotGlowDesktopEndScale,
          y: choreography.dotGlowDesktopEndScale,
          duration: choreography.dotGlowInDuration,
          ease: "power2.out",
        }, choreography.dotGlowAt)
        .to(glowMaterial, {
          opacity: 0,
          duration: choreography.dotGlowFadeDuration,
          ease: "power2.in",
        }, choreography.dotGlowFadeAt)
        .to(cameraState, {
          ...sceneTheme.camera.foundation,
          duration: choreography.foundationCameraDuration,
          ease: "power3.inOut",
        }, choreography.firstLineAt)
        .to(drawingDot.scale, {
          x: 0.82,
          y: 0.82,
          z: 0.82,
          duration: choreography.dotSettleDuration,
        }, choreography.firstLineAt);

      drawSegment(timeline, firstLine, choreography.firstLineAt, choreography.firstLineDuration, true);
      drawGroup(timeline, square, choreography.squareAt, choreography.squareDuration, choreography.squareStagger);

      timeline
        .to(cameraState, {
          ...sceneTheme.camera.room,
          duration: choreography.roomCameraDuration,
          ease: "sine.inOut",
        }, choreography.roomCameraAt)
        .to(dotMaterial, { opacity: 0, duration: choreography.dotExitDuration }, choreography.dotExitAt)
        .set(drawingDot, { visible: false }, choreography.dotHideAt);

      drawGroup(timeline, firstRoom.slice(0, 4), choreography.firstRoomAt, 0.62, 0.08);
      drawGroup(timeline, firstRoom.slice(4), choreography.firstRoomTopAt, 0.4, 0.1);
      drawGroup(timeline, firstRoomDetails, choreography.firstDetailsAt, 0.26, 0.035);

      timeline
        .to(glassMeshes[0].material, { opacity: 0.075, duration: 0.5 }, choreography.firstGlassAt)
        .to(cameraState, {
          ...sceneTheme.camera.wing,
          duration: 1.45,
          ease: "power2.inOut",
        }, choreography.wingCameraAt);

      drawGroup(timeline, secondRoom, choreography.secondRoomAt, 0.38, 0.075);
      drawGroup(timeline, secondRoomDetails, choreography.secondDetailsAt, 0.24, 0.028);
      timeline.to([glassMeshes[1].material, glassMeshes[2].material], { opacity: 0.075, duration: 0.45 }, choreography.secondGlassAt);

      floorSpecs.forEach((_, floorIndex) => {
        const startTime = choreography.upperFloorAt + floorIndex * 0.72;
        drawGroup(timeline, upperFloors[floorIndex], startTime, 0.28, 0.028);
        drawGroup(timeline, upperDetails[floorIndex], startTime + 0.34, 0.2, 0.018);
        timeline.to(slabMeshes[floorIndex].material, { opacity: 0.05, duration: 0.35 }, startTime + 0.08);
        timeline.to(glassMeshes[floorIndex + 3].material, { opacity: 0.065, duration: 0.4 }, startTime + 0.48);
      });

      timeline.to(cameraState, {
        ...sceneTheme.camera.reveal,
        duration: choreography.revealCameraDuration,
        ease: "sine.inOut",
      }, choreography.revealCameraAt);

      drawGroup(timeline, houseAccents, choreography.accentsAt, 0.24, 0.025);
      drawGroup(timeline, roofFrame, choreography.roofAt, 0.24, 0.028);
      drawGroup(timeline, roofDetails, choreography.roofDetailsAt, 0.2, 0.022);

      timeline
        .to(cameraState, {
          ...sceneTheme.camera.orbit,
          duration: choreography.orbitDuration,
          ease: "power2.inOut",
        }, choreography.orbitAt)
        .to(building.rotation, {
          y: sceneTheme.buildingRotationEnd,
          duration: choreography.orbitDuration,
          ease: "sine.inOut",
        }, choreography.orbitAt)
        .to(building.scale, {
          x: sceneTheme.buildingExitScale,
          y: sceneTheme.buildingExitScale,
          z: sceneTheme.buildingExitScale,
          duration: choreography.buildingExitDuration,
        }, choreography.identityAt)
        .to(canvas, { autoAlpha: 0, duration: choreography.canvasExitDuration }, choreography.identityAt)
        .to(logo, {
          autoAlpha: 1,
          scale: 1,
          duration: choreography.logoEnterDuration,
          ease: "back.out(1.8)",
        }, choreography.logoAt)
        .to(caption, {
          autoAlpha: 1,
          y: 0,
          duration: choreography.captionEnterDuration,
        }, choreography.captionAt)
        .to({}, { duration: choreography.identityHoldDuration })
        .to([logo, caption], {
          autoAlpha: 0,
          scale: sceneTheme.identityExitScale,
          duration: choreography.identityExitDuration,
        })
        .to(overlay, { autoAlpha: 0, duration: choreography.overlayExitDuration }, "<");
    }, overlay);

    return () => {
      context.revert();
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div className="ssa-loader" ref={overlayRef}>
      <canvas className="ssa-loader__canvas" ref={canvasRef} aria-hidden="true" />
      <div className="ssa-loader__film" aria-hidden="true" />
      <div className="ssa-loader__logo-wrap" ref={logoRef}>
        <LogoMark className="ssa-loader__logo" size={512} priority />
      </div>
      <p className="ssa-loader__caption" ref={captionRef}>
        VastuVibe Group <span>Limited</span>
      </p>
    </div>
  );
}
