import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { sans, tall } from "./tokens";

const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

// Face artwork for the card, drawn once to a canvas.
const useFaceTexture = (title: string, subtitle: string) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1360;
    c.height = 860;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, c.width, c.height);
    // Photo slot
    g.strokeStyle = "rgba(255,255,255,0.55)";
    g.lineWidth = 6;
    g.beginPath();
    g.roundRect(90, 170, 330, 420, 36);
    g.stroke();
    g.fillStyle = "rgba(255,255,255,0.75)";
    g.beginPath();
    g.arc(255, 330, 70, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(255, 520, 120, 80, 0, Math.PI, 0);
    g.fill();
    // Text block
    g.fillStyle = "#f4f3ef";
    g.font = `300 210px ${tall}`;
    g.fillText(title, 500, 380);
    g.fillStyle = "rgba(244,243,239,0.65)";
    g.font = `500 54px ${sans}`;
    g.fillText(subtitle, 506, 470);
    g.fillStyle = "rgba(244,243,239,0.35)";
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.roundRect(506, 540 + i * 46, 600 - i * 140, 18, 9);
      g.fill();
    }
    g.font = `600 40px ${sans}`;
    g.fillStyle = "rgba(244,243,239,0.5)";
    g.fillText("ID · 0427", 90, 720);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [title, subtitle]);

// Studio reflections so the black lacquer and silver edge catch real highlights.
const StudioEnv: React.FC = () => {
  const { gl, scene } = useThree();
  // Built during render, not in an effect, so the very first captured frame already has reflections.
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }, [gl, scene]);
  return null;
};

const Card: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const geom = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(3.4, 2.15, 0.22), {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 6,
      curveSegments: 24,
    });
    g.center();
    return g;
  }, []);
  const face = useFaceTexture(title, subtitle);
  const enter = spring({ frame, fps, config: { damping: 18, mass: 1.2 } });
  const rotY = interpolate(frame, [0, 90], [-0.75, 0.35]) + (1 - enter) * -1.2;
  const rotX = 0.18 + Math.sin(frame / 40) * 0.05;
  const y = Math.sin(frame / 30) * 0.06 + (1 - enter) * -1.5;
  // A soft highlight light sweeps across the surface for a premium sheen.
  const sweep = interpolate(frame, [10, 70], [-5, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, -1, -3]} intensity={1.2} color="#ffffff" />
      <pointLight position={[sweep, 1.2, 2.2]} intensity={14} distance={8} />
      <StudioEnv />
      <group position={[0, y - 0.35, 0]} rotation={[rotX, rotY, -0.06]} scale={enter}>
        <mesh geometry={geom}>
          <meshPhysicalMaterial color="#0e0e0e" metalness={0.35} roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.4} />
        </mesh>
        {/* Brushed-silver edge strip */}
        <mesh position={[0, 0, -0.072]}>
          <planeGeometry args={[3.48, 2.23]} />
          <meshStandardMaterial color="#d6d6d6" metalness={1} roughness={0.28} envMapIntensity={1.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.068]}>
          <planeGeometry args={[3.3, 2.08]} />
          <meshBasicMaterial map={face} transparent toneMapped={false} />
        </mesh>
      </group>
    </>
  );
};

export const Card3D: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 30, position: [0, 0, 15] }} gl={{ antialias: true }}>
      <Card title={title} subtitle={subtitle} />
    </ThreeCanvas>
  );
};
