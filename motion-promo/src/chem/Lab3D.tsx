import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

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

const atomMat = (color: string) => (
  <meshPhysicalMaterial color={color} roughness={0.18} metalness={0.1} clearcoat={1} clearcoatRoughness={0.06} />
);

type Atom = { p: [number, number, number]; r: number; c: string };

const Bond: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; color?: string; opacity?: number }> = ({ a, b, color = "#cfe9ff", opacity = 1 }) => {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[0.07, 0.07, dir.length(), 24]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} transparent opacity={opacity} />
    </mesh>
  );
};

const Molecule: React.FC<{ atoms: Atom[]; bonds: [number, number][]; brokenBond?: number }> = ({ atoms, bonds, brokenBond }) => {
  const frame = useCurrentFrame();
  const v = atoms.map((a) => new THREE.Vector3(...a.p));
  return (
    <>
      {atoms.map((a, i) => (
        <mesh key={i} position={a.p}>
          <sphereGeometry args={[a.r, 48, 48]} />
          {atomMat(a.c)}
        </mesh>
      ))}
      {bonds.map(([i, j], k) => {
        if (k !== brokenBond) return <Bond key={k} a={v[i]} b={v[j]} />;
        // The broken link: two stubs with a flickering gap between them.
        const gap = 0.32 + Math.sin(frame / 4) * 0.04;
        const d = v[j].clone().sub(v[i]);
        const m1 = v[i].clone().add(d.clone().multiplyScalar(0.5 - gap / d.length()));
        const m2 = v[i].clone().add(d.clone().multiplyScalar(0.5 + gap / d.length()));
        const flick = 0.35 + 0.65 * Math.abs(Math.sin(frame / 6));
        return (
          <React.Fragment key={k}>
            <Bond a={v[i]} b={m1} color="#ff8a8a" opacity={flick} />
            <Bond a={m2} b={v[j]} color="#ff8a8a" opacity={flick} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// Two clusters ("school" and "institute") joined by a link that is broken.
const BrokenChain: React.FC = () => {
  const atoms: Atom[] = [
    { p: [-1.6, 0.3, 0], r: 0.42, c: "#3fa9ff" },
    { p: [-2.25, 0.95, 0.3], r: 0.26, c: "#eef8ff" },
    { p: [-2.2, -0.35, -0.3], r: 0.26, c: "#eef8ff" },
    { p: [-1.1, 1.0, -0.2], r: 0.24, c: "#46e0ff" },
    { p: [1.6, -0.3, 0], r: 0.42, c: "#2ee59d" },
    { p: [2.25, 0.4, -0.3], r: 0.26, c: "#eef8ff" },
    { p: [2.15, -1.0, 0.3], r: 0.26, c: "#eef8ff" },
    { p: [1.15, -1.0, 0.2], r: 0.24, c: "#46e0ff" },
  ];
  const bonds: [number, number][] = [[0, 1], [0, 2], [0, 3], [4, 5], [4, 6], [4, 7], [0, 4]];
  return <Molecule atoms={atoms} bonds={bonds} brokenBond={6} />;
};

// A small benzene-like ring with side atoms, for the opener.
const Ring: React.FC = () => {
  const atoms: Atom[] = [];
  const bonds: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    atoms.push({ p: [Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0], r: 0.3, c: i % 2 ? "#2ee59d" : "#3fa9ff" });
    bonds.push([i, (i + 1) % 6]);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    atoms.push({ p: [Math.cos(a) * 2.05, Math.sin(a) * 2.05, 0], r: 0.19, c: "#eef8ff" });
    bonds.push([i, i + 6]);
  }
  return <Molecule atoms={atoms} bonds={bonds} />;
};

// Four answer bubbles A–D; B lights up green as the "known" answer.
const Answers: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [20, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const on = i === 1;
        const c = on ? new THREE.Color("#3fa9ff").lerp(new THREE.Color("#2ee59d"), glow) : new THREE.Color("#d9ecff");
        return (
          <mesh key={i} position={[(i - 1.5) * 1.25, Math.sin(frame / 15 + i) * 0.08, 0]}>
            <sphereGeometry args={[0.46, 48, 48]} />
            <meshPhysicalMaterial color={c} emissive={on ? "#2ee59d" : "#000000"} emissiveIntensity={on ? glow * 0.6 : 0} roughness={0.15} clearcoat={1} />
          </mesh>
        );
      })}
      {/* A cyan chrome question mark floating above */}
      <group position={[0, 1.7, 0]} scale={0.55} rotation={[0, Math.sin(frame / 25) * 0.6, 0]}>
        <mesh position={[0, 0.85, 0]} rotation={[0, 0, -0.5 * Math.PI]}>
          <torusGeometry args={[0.62, 0.17, 32, 96, 1.45 * Math.PI]} />
          <meshStandardMaterial color="#9fe6ff" metalness={1} roughness={0.12} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <capsuleGeometry args={[0.17, 0.42, 12, 32]} />
          <meshStandardMaterial color="#9fe6ff" metalness={1} roughness={0.12} />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <sphereGeometry args={[0.2, 48, 48]} />
          <meshStandardMaterial color="#9fe6ff" metalness={1} roughness={0.12} />
        </mesh>
      </group>
    </>
  );
};

// Erlenmeyer flask in clear glass with glowing green liquid and rising bubbles.
const Flask: React.FC = () => {
  const frame = useCurrentFrame();
  const glass = useMemo(() => {
    const pts = [
      [0.0, -1.3], [1.15, -1.3], [1.25, -1.2], [0.42, 0.55], [0.38, 1.25], [0.46, 1.32],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  const liquid = useMemo(() => {
    const pts = [[0.0, -1.24], [1.08, -1.24], [1.14, -1.16], [0.78, -0.25], [0.0, -0.25]].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  return (
    <>
      <mesh geometry={liquid}>
        <meshPhysicalMaterial color="#2ee59d" emissive="#16a86c" emissiveIntensity={0.55} roughness={0.1} transmission={0.3} transparent opacity={0.92} />
      </mesh>
      <mesh geometry={glass}>
        <meshPhysicalMaterial color="#e8f6ff" roughness={0.04} metalness={0} transmission={1} thickness={0.25} ior={1.45} transparent opacity={0.35} side={THREE.DoubleSide} clearcoat={1} />
      </mesh>
      {new Array(9).fill(0).map((_, i) => {
        const t = ((frame + i * 11) % 60) / 60;
        return (
          <mesh key={i} position={[Math.sin(i * 2.1) * 0.5 * (1 - t), -1.15 + t * 0.85, Math.cos(i * 1.7) * 0.4 * (1 - t)]}>
            <sphereGeometry args={[0.05 + (i % 3) * 0.02, 16, 16]} />
            <meshPhysicalMaterial color="#d9fff0" transparent opacity={1 - t} roughness={0.05} />
          </mesh>
        );
      })}
    </>
  );
};

const VARIANTS = { ring: Ring, broken: BrokenChain, answers: Answers, flask: Flask };
const SCALE = { ring: 0.72, broken: 0.7, answers: 0.68, flask: 1 };

const Rig: React.FC<{ variant: keyof typeof VARIANTS; y: number }> = ({ variant, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, mass: 1.1 } });
  const Body = VARIANTS[variant];
  const spin = variant === "flask" || variant === "answers" ? Math.sin(frame / 40) * 0.35 : interpolate(frame, [0, 150], [-0.6, 0.9]);
  const sweep = interpolate(frame, [5, 80], [-5, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <StudioEnv />
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#cfe9ff" />
      <pointLight position={[-3, -2, 2]} intensity={10} distance={9} color="#2ee59d" />
      <pointLight position={[sweep, 2, 3]} intensity={14} distance={9} color="#46e0ff" />
      <group position={[0, y + Math.sin(frame / 30) * 0.06, 0]} rotation={[0.15, spin + (1 - enter) * -1.2, 0]} scale={enter * SCALE[variant]}>
        <Body />
      </group>
    </>
  );
};

export const Lab3D: React.FC<{ variant: keyof typeof VARIANTS; y?: number }> = ({ variant, y = 0 }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 30, position: [0, 0, 14] }} gl={{ antialias: true }}>
      <Rig variant={variant} y={y} />
    </ThreeCanvas>
  );
};
