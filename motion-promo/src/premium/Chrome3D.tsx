import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import antonJson from "../fonts3d/anton.typeface.json";

const font = new FontLoader().parse(antonJson as unknown as Parameters<FontLoader["parse"]>[0]);

const StudioEnv: React.FC = () => {
  const { gl, scene } = useThree();
  // Built during render so the first captured frame already has reflections.
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }, [gl, scene]);
  return null;
};

const chrome = <meshStandardMaterial color="#e9e9e9" metalness={1} roughness={0.12} />;

const ChromeText: React.FC<{ text: string; maxWidth: number }> = ({ text, maxWidth }) => {
  const { geom, scale } = useMemo(() => {
    const g = new TextGeometry(text, { font, size: 1, depth: 0.28, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.022, bevelSegments: 5 });
    g.computeBoundingBox();
    g.center();
    const w = g.boundingBox!.max.x - g.boundingBox!.min.x;
    return { geom: g, scale: Math.min(1.6, maxWidth / w) };
  }, [text, maxWidth]);
  return (
    <mesh geometry={geom} scale={scale}>
      {chrome}
    </mesh>
  );
};

// Chrome coins circling the text.
const Coins: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(6).fill(0).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + frame / 45;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.75, Math.sin(a) * 0.9 - 0.05, -0.9 + Math.sin(a * 2) * 0.25]} rotation={[Math.PI / 2 + a, a * 1.3, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.06, 48]} />
            {chrome}
          </mesh>
        );
      })}
    </>
  );
};

const Rig: React.FC<{ text: string; coins?: boolean; maxWidth: number; y: number }> = ({ text, coins, maxWidth, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, mass: 1.1 } });
  const rotY = interpolate(frame, [0, 90], [-0.55, 0.35]) + (1 - enter) * -1.3;
  const sweep = interpolate(frame, [5, 80], [-5, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <StudioEnv />
      <ambientLight intensity={0.15} />
      <pointLight position={[sweep, 1.5, 3]} intensity={18} distance={9} />
      <group position={[0, y + Math.sin(frame / 30) * 0.05, 0]} rotation={[0.08, rotY, 0]} scale={enter}>
        <ChromeText text={text} maxWidth={maxWidth} />
        {coins ? <Coins /> : null}
      </group>
    </>
  );
};

export const Chrome3D: React.FC<{ text: string; coins?: boolean; maxWidth?: number; y?: number }> = ({ text, coins, maxWidth = 3.4, y = 0 }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 30, position: [0, 0, 14] }} gl={{ antialias: true }}>
      <Rig text={text} coins={coins} maxWidth={maxWidth} y={y} />
    </ThreeCanvas>
  );
};
