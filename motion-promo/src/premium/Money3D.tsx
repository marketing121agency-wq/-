import React, { useMemo } from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";

// Stylised banknote face drawn to a canvas (deliberately not a replica of real currency).
const useBillTexture = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 440;
    const g = c.getContext("2d")!;
    const bg = g.createLinearGradient(0, 0, 1024, 440);
    bg.addColorStop(0, "#dfe6d3");
    bg.addColorStop(0.5, "#c9d6b8");
    bg.addColorStop(1, "#b8c8a4");
    g.fillStyle = bg;
    g.fillRect(0, 0, 1024, 440);
    g.strokeStyle = "#4f6b45";
    g.lineWidth = 10;
    g.strokeRect(22, 22, 980, 396);
    g.lineWidth = 3;
    g.strokeRect(40, 40, 944, 360);
    // Fine guilloche lines
    g.strokeStyle = "rgba(79,107,69,0.25)";
    g.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      g.beginPath();
      for (let x = 40; x <= 984; x += 8) {
        const y = 220 + Math.sin(x / 40 + i * 0.4) * (150 - i * 3);
        if (x === 40) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    // Centre medallion
    g.fillStyle = "#e9efe0";
    g.beginPath();
    g.ellipse(512, 220, 120, 150, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#4f6b45";
    g.lineWidth = 6;
    g.stroke();
    g.fillStyle = "#3e5636";
    g.font = "bold 190px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("$", 512, 228);
    // Corner values
    g.font = "bold 92px Georgia, serif";
    g.fillText("100", 140, 105);
    g.fillText("100", 884, 335);
    g.font = "bold 52px Georgia, serif";
    g.fillText("100", 884, 105);
    g.fillText("100", 140, 335);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);

// Side of a bundle: many thin paper edges.
const useEdgeTexture = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const g = c.getContext("2d")!;
    for (let y = 0; y < 256; y += 4) {
      g.fillStyle = y % 8 ? "#d5ddc7" : "#aebb9b";
      g.fillRect(0, y, 64, 4);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

const W = 2.2;
const D = 0.94;
const H = 0.32;

const Bundle: React.FC<{ position: [number, number, number]; rotY?: number; face: THREE.Texture; edge: THREE.Texture }> = ({ position, rotY = 0, face, edge }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    <mesh>
      <boxGeometry args={[W, H, D]} />
      <meshStandardMaterial attach="material-0" map={edge} color="#9aa391" roughness={0.85} envMapIntensity={0.4} />
      <meshStandardMaterial attach="material-1" map={edge} color="#9aa391" roughness={0.85} envMapIntensity={0.4} />
      <meshStandardMaterial attach="material-2" map={face} color="#a7b19c" roughness={0.7} envMapIntensity={0.4} />
      <meshStandardMaterial attach="material-3" map={face} color="#a7b19c" roughness={0.7} envMapIntensity={0.4} />
      <meshStandardMaterial attach="material-4" map={edge} color="#9aa391" roughness={0.85} envMapIntensity={0.4} />
      <meshStandardMaterial attach="material-5" map={edge} color="#9aa391" roughness={0.85} envMapIntensity={0.4} />
    </mesh>
    {/* Paper strap round the middle */}
    <mesh>
      <boxGeometry args={[0.36, H + 0.012, D + 0.012]} />
      <meshStandardMaterial color="#b9ad8a" roughness={0.7} envMapIntensity={0.4} />
    </mesh>
  </group>
);

// A stepped pile of bundles that drops in, bundle by bundle.
export const MoneyStack: React.FC<{ y?: number }> = ({ y = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const face = useBillTexture();
  const edge = useEdgeTexture();
  const layout: [number, number, number, number][] = [
    [-1.15, 0, 0.55, 0.05], [1.15, 0, 0.55, -0.04], [0, 0, -0.5, 0.02], [-1.15, 0, -0.5, -0.06], [1.15, 0, -0.5, 0.07],
    [-0.58, 1, 0.1, 0.12], [0.58, 1, 0.1, -0.1], [0, 1, -0.6, 0.04],
    [0, 2, 0, 0.2],
  ];
  return (
    <group position={[0, y, 0]}>
      {layout.map(([x, level, z, r], i) => {
        const p = spring({ frame: frame - i * 2, fps, config: { damping: 14, mass: 0.8 } });
        return <Bundle key={i} face={face} edge={edge} rotY={r} position={[x, level * H + (1 - p) * 3, z]} />;
      })}
    </group>
  );
};

// Loose bills fluttering down through the frame.
export const FallingBills: React.FC<{ count?: number; seed?: string; spread?: number }> = ({ count = 22, seed = "b", spread = 4 }) => {
  const frame = useCurrentFrame();
  const face = useBillTexture();
  const geom = useMemo(() => new THREE.PlaneGeometry(1.1, 0.47, 12, 1), []);
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}${k}${i}`);
        const speed = 0.035 + r("s") * 0.03;
        const yy = 4.2 - ((frame * speed + r("y") * 9) % 9);
        const x = (r("x") - 0.5) * spread + Math.sin(frame / 18 + i) * 0.35;
        const z = (r("z") - 0.5) * 3 - 0.5;
        return (
          <mesh
            key={i}
            geometry={geom}
            position={[x, yy, z]}
            rotation={[frame / (22 + r("a") * 20) + i, frame / (30 + r("b") * 25) + i * 2, Math.sin(frame / 15 + i) * 0.6]}
          >
            <meshStandardMaterial map={face} color="#aab49f" side={THREE.DoubleSide} roughness={0.7} envMapIntensity={0.4} />
          </mesh>
        );
      })}
    </>
  );
};

// Gentle turntable for the pile.
export const useTurn = () => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, 90], [-0.45, 0.35]);
};
