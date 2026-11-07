import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

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

// Chrome question mark built from a torus arc, a stem and a dot, turning slowly.
const Mark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15, mass: 1.1 } });
  const rotY = interpolate(frame, [0, 90], [-1.1, 0.6]) + (1 - enter) * -1.5;
  const sweep = interpolate(frame, [5, 75], [-4, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <StudioEnv />
      <ambientLight intensity={0.15} />
      <pointLight position={[sweep, 1.5, 3]} intensity={18} distance={9} />
      <group rotation={[0.08, rotY, 0]} position={[0, Math.sin(frame / 28) * 0.07 - 0.55, 0]} scale={enter * 0.92}>
        <mesh position={[0, 0.85, 0]} rotation={[0, 0, -0.5 * Math.PI]}>
          <torusGeometry args={[0.62, 0.17, 32, 96, 1.45 * Math.PI]} />
          <meshStandardMaterial color="#e8e8e8" metalness={1} roughness={0.12} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <capsuleGeometry args={[0.17, 0.42, 12, 32]} />
          <meshStandardMaterial color="#e8e8e8" metalness={1} roughness={0.12} />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <sphereGeometry args={[0.2, 48, 48]} />
          <meshStandardMaterial color="#e8e8e8" metalness={1} roughness={0.12} />
        </mesh>
      </group>
    </>
  );
};

export const Question3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 30, position: [0, 0, 11] }} gl={{ antialias: true }}>
      <Mark />
    </ThreeCanvas>
  );
};
