"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { motionTheme } from "@/lib/motion-theme";

type SceneProps = {
  active: boolean;
  progress: { current: number };
  onReady: () => void;
};

function ParticleField({ progress }: Pick<SceneProps, "progress">) {
  const backRef = useRef<THREE.Points>(null);
  const frontRef = useRef<THREE.Points>(null);
  const { backPositions, backColors, frontPositions, frontColors } = useMemo(() => {
    const total = motionTheme.hero.desktopParticleCount;
    const backCount = Math.round(total * 0.6);
    const frontCount = total - backCount;
    const fill = (count: number, front: boolean) => {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const dark = new THREE.Color("#C9A96A");
      const bright = new THREE.Color("#E8CFA0");
      for (let index = 0; index < count; index += 1) {
        const offset = index * 3;
        positions[offset] = (Math.random() - 0.5) * 12;
        positions[offset + 1] = (Math.random() - 0.5) * 9;
        positions[offset + 2] = front ? 0.55 + Math.random() * 2.4 : -1.9 - Math.random() * 3.8;
        const color = dark.clone().lerp(bright, Math.random());
        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
      }
      return { positions, colors };
    };
    const back = fill(backCount, false);
    const front = fill(frontCount, true);
    return {
      backPositions: back.positions,
      backColors: back.colors,
      frontPositions: front.positions,
      frontColors: front.colors,
    };
  }, []);

  useFrame((_, delta) => {
    if (backRef.current) {
      backRef.current.rotation.y += delta * 0.008;
      backRef.current.position.y += delta * (0.018 + progress.current * 0.18);
      if (backRef.current.position.y > 1.4) backRef.current.position.y = 0;
    }
    if (frontRef.current) {
      frontRef.current.rotation.y -= delta * 0.012;
      frontRef.current.position.y += delta * (0.04 + progress.current * 1.25);
      if (frontRef.current.position.y > 2.1) frontRef.current.position.y = -0.4;
    }
  });

  return (
    <>
      <points ref={backRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[backPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[backColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          sizeAttenuation
          transparent
          opacity={0.7}
          vertexColors
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points ref={frontRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[frontPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[frontColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.84}
          vertexColors
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

function Tower({ progress }: Pick<SceneProps, "progress">) {
  const groupRef = useRef<THREE.Group>(null);
  const [towerTexture, glowTexture] = useTexture([
    "/media/cutouts/tower-hero.png",
    "/media/cutouts/tower-hero-glow.png",
  ]);
  const { camera, pointer } = useThree();

  useEffect(() => {
    for (const texture of [towerTexture, glowTexture]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.needsUpdate = true;
    }
  }, [glowTexture, towerTexture]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const progressValue = progress.current;
    const elapsed = state.clock.elapsedTime;
    const idleY = Math.sin(elapsed * 0.42) * THREE.MathUtils.degToRad(motionTheme.hero.maxIdleRotationY);
    const idleZ = Math.cos(elapsed * 0.35) * THREE.MathUtils.degToRad(motionTheme.hero.maxIdleRotationZ);
    const pointerYaw = pointer.x * THREE.MathUtils.degToRad(motionTheme.hero.maxPointerRotation);
    const scale = THREE.MathUtils.lerp(
      motionTheme.hero.towerScaleStart,
      motionTheme.hero.towerScaleEnd,
      progressValue,
    );

    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.y = -0.12 - progressValue * motionTheme.hero.desktopTowerTravel;
    groupRef.current.rotation.y = THREE.MathUtils.clamp(
      idleY + pointerYaw,
      -THREE.MathUtils.degToRad(motionTheme.hero.maxIdleRotationY),
      THREE.MathUtils.degToRad(motionTheme.hero.maxIdleRotationY),
    );
    groupRef.current.rotation.z = THREE.MathUtils.clamp(
      idleZ,
      -THREE.MathUtils.degToRad(motionTheme.hero.maxIdleRotationZ),
      THREE.MathUtils.degToRad(motionTheme.hero.maxIdleRotationZ),
    );
    camera.position.z = 7 - progressValue * motionTheme.hero.cameraDolly;
    camera.updateProjectionMatrix();
  });

  return (
    <Float speed={0.55} rotationIntensity={0} floatIntensity={0.18} floatingRange={[-0.08, 0.08]}>
      <group ref={groupRef} position={[1.38, -0.12, 0]}>
        <mesh position={[0, 0, -0.06]} scale={1.04}>
          <planeGeometry args={[1.55, 5.92]} />
          <meshBasicMaterial
            map={glowTexture}
            transparent
            opacity={0.54}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <mesh>
          <planeGeometry args={[1.5, 5.72]} />
          <meshBasicMaterial map={towerTexture} transparent alphaTest={0.025} depthWrite toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene({ progress, onReady }: Omit<SceneProps, "active">) {
  const { gl } = useThree();

  useEffect(() => {
    gl.setClearColor("#0B0B0F", 0);
    onReady();
  }, [gl, onReady]);

  return (
    <>
      <ParticleField progress={progress} />
      <Tower progress={progress} />
    </>
  );
}

export function RisingTowerScene({ active, progress, onReady }: SceneProps) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, motionTheme.hero.desktopDpr]}
      camera={{ position: [0, 0, 7], fov: 48, near: 0.1, far: 50 }}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
    >
      <Scene progress={progress} onReady={onReady} />
    </Canvas>
  );
}

