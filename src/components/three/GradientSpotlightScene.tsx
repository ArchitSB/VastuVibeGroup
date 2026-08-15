"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motionTheme } from "@/lib/motion-theme";

type GradientSpotlightSceneProps = {
  urls: readonly string[];
  activeIndex: number;
  onUnavailable?: () => void;
};

type SceneController = {
  transitionTo: (index: number) => void;
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uCurrent;
  uniform sampler2D uNext;
  uniform float uMix;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uCurrentAspect;
  uniform float uNextAspect;
  varying vec2 vUv;

  float random(vec2 point) {
    return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(random(cell), random(cell + vec2(1.0, 0.0)), local.x),
      mix(random(cell + vec2(0.0, 1.0)), random(cell + vec2(1.0, 1.0)), local.x),
      local.y
    );
  }

  vec2 coverUv(vec2 uv, float imageAspect) {
    float screenAspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 scale = screenAspect > imageAspect
      ? vec2(1.0, imageAspect / screenAspect)
      : vec2(screenAspect / imageAspect, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    float grain = noise(vUv * 7.0 + vec2(uTime * 0.035, -uTime * 0.02));
    float diagonal = vUv.x * 0.32 + (1.0 - vUv.y) * 0.18;
    float dissolve = smoothstep(uMix - 0.16, uMix + 0.16, grain * 0.68 + diagonal);
    vec2 bend = vec2((dissolve - 0.5) * 0.018, 0.0);
    vec4 fromColor = texture2D(uCurrent, coverUv(vUv + bend, uCurrentAspect));
    vec4 toColor = texture2D(uNext, coverUv(vUv - bend, uNextAspect));
    vec3 color = mix(fromColor.rgb, toColor.rgb, dissolve);
    color *= vec3(0.74, 0.75, 0.78);
    color += vec3(0.055, 0.038, 0.014) * (1.0 - abs(dissolve - 0.5) * 2.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function selectShaderPrecision(
  context: WebGLRenderingContext | WebGL2RenderingContext,
): "highp" | "mediump" | "lowp" | null {
  const candidates = [
    ["highp", context.HIGH_FLOAT],
    ["mediump", context.MEDIUM_FLOAT],
    ["lowp", context.LOW_FLOAT],
  ] as const;

  for (const [precision, format] of candidates) {
    const vertex = context.getShaderPrecisionFormat(context.VERTEX_SHADER, format);
    const fragment = context.getShaderPrecisionFormat(context.FRAGMENT_SHADER, format);
    if (vertex?.precision && fragment?.precision) return precision;
  }

  return null;
}

export default function GradientSpotlightScene({
  urls,
  activeIndex,
  onUnavailable,
}: GradientSpotlightSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<SceneController | null>(null);
  const initialActiveIndexRef = useRef(activeIndex);

  useEffect(() => {
    controllerRef.current?.transitionTo(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | undefined;
    const contextAttributes: WebGLContextAttributes = {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    };
    const context =
      canvas.getContext("webgl2", contextAttributes) ?? canvas.getContext("webgl", contextAttributes);
    const precision = context ? selectShaderPrecision(context) : null;

    if (!context || !precision) {
      onUnavailable?.();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, context, precision, ...contextAttributes });
    } catch {
      onUnavailable?.();
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, motionTheme.hero.desktopDpr));
    renderer.setClearColor(0x0b0b0f, 1);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const loader = new THREE.TextureLoader();

    Promise.all(urls.map((url) => loader.loadAsync(url)))
      .then((textures) => {
        if (disposed) {
          textures.forEach((texture) => texture.dispose());
          return;
        }
        textures.forEach((texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
        });

        let currentIndex = initialActiveIndexRef.current;
        let requestedIndex = initialActiveIndexRef.current;
        let transitionTarget = initialActiveIndexRef.current;
        let transitionFrom = 0;
        let transitioning = false;
        const aspectOf = (texture: THREE.Texture) => {
          const image = texture.image as HTMLImageElement;
          return image.naturalWidth / image.naturalHeight;
        };
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uCurrent: { value: textures[currentIndex] },
            uNext: { value: textures[currentIndex] },
            uMix: { value: 0 },
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uCurrentAspect: { value: aspectOf(textures[currentIndex]) },
            uNextAspect: { value: aspectOf(textures[currentIndex]) },
          },
          vertexShader,
          fragmentShader,
          depthTest: false,
          depthWrite: false,
        });
        const scene = new THREE.Scene();
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const beginTransition = (index: number) => {
          const next = ((index % textures.length) + textures.length) % textures.length;
          requestedIndex = next;
          if (transitioning || next === currentIndex) return;
          transitionTarget = next;
          material.uniforms.uNext.value = textures[next];
          material.uniforms.uNextAspect.value = aspectOf(textures[next]);
          material.uniforms.uMix.value = 0;
          transitionFrom = performance.now();
          transitioning = true;
        };
        controllerRef.current = { transitionTo: beginTransition };

        const resize = () => {
          const width = Math.max(1, canvas.clientWidth);
          const height = Math.max(1, canvas.clientHeight);
          renderer.setSize(width, height, false);
          material.uniforms.uResolution.value.set(width, height);
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        resize();

        const render = (time: number) => {
          if (disposed) return;
          material.uniforms.uTime.value = time / 1000;
          if (transitioning) {
            const raw = Math.min(
              1,
              (time - transitionFrom) / (motionTheme.duration.spotlightDissolve * 1000),
            );
            material.uniforms.uMix.value = raw * raw * (3 - 2 * raw);
            if (raw === 1) {
              currentIndex = transitionTarget;
              material.uniforms.uCurrent.value = textures[currentIndex];
              material.uniforms.uCurrentAspect.value = aspectOf(textures[currentIndex]);
              material.uniforms.uMix.value = 0;
              transitioning = false;
              if (requestedIndex !== currentIndex) beginTransition(requestedIndex);
            }
          }
          renderer.render(scene, camera);
          animationFrame = requestAnimationFrame(render);
        };
        animationFrame = requestAnimationFrame(render);
        beginTransition(initialActiveIndexRef.current);

        const dispose = () => {
          cancelAnimationFrame(animationFrame);
          resizeObserver?.disconnect();
          controllerRef.current = null;
          scene.remove(mesh);
          geometry.dispose();
          material.dispose();
          textures.forEach((texture) => texture.dispose());
          renderer.renderLists.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
        };
        canvas.dataset.disposeReady = "true";
        (canvas as HTMLCanvasElement & { __dispose?: () => void }).__dispose = dispose;
      })
      .catch(() => {
        if (!disposed) onUnavailable?.();
      });

    return () => {
      disposed = true;
      const dispose = (canvas as HTMLCanvasElement & { __dispose?: () => void }).__dispose;
      if (dispose) dispose();
      else {
        cancelAnimationFrame(animationFrame);
        resizeObserver?.disconnect();
        geometry.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      }
    };
  }, [onUnavailable, urls]);

  return <canvas ref={canvasRef} className="spotlight__canvas" aria-hidden="true" />;
}
