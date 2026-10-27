import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Camera punch-ins: eases between zoom levels at given frames, with optional impact shakes.
export const PunchCamera: React.FC<{
  keys: [number, number][];
  shakes?: number[];
  children: React.ReactNode;
}> = ({ keys, shakes = [], children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let scale = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const p = spring({ frame: frame - keys[i][0], fps, config: { damping: 20, stiffness: 140 } });
    scale += (keys[i][1] - keys[i - 1][1]) * p;
  }
  let x = 0;
  let y = 0;
  for (const s of shakes) {
    const t = frame - s;
    if (t >= 0 && t < 10) {
      const k = (1 - t / 10) * 14;
      x += (random(`sx${s}-${t}`) - 0.5) * k;
      y += (random(`sy${s}-${t}`) - 0.5) * k;
    }
  }
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: "50% 35%" }}>
      {children}
    </AbsoluteFill>
  );
};

// Short white flash on a cut.
export const Flash: React.FC<{ at: number; color?: string; peak?: number }> = ({ at, color = "white", peak = 0.85 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - at, [-2, 0, 6], [0, peak, 0], clamp);
  return <AbsoluteFill style={{ backgroundColor: color, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

// Warm light leak sweeping across the frame.
export const LightLeak: React.FC<{ at: number; length?: number }> = ({ at, length = 22 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, length], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const x = interpolate(p, [0, 1], [-40, 140]);
  const o = Math.sin(p * Math.PI) * 0.9;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 55% 70% at ${x}% 40%, rgba(255,170,40,${o}) 0%, rgba(255,90,0,${o * 0.5}) 40%, transparent 70%)`,
        mixBlendMode: "screen",
      }}
    />
  );
};

// Four-point glints bursting outward from a point.
export const SparkleBurst: React.FC<{ at: number; x: number; y: number; color: string; count?: number; spread?: number }> = ({
  at,
  x,
  y,
  color,
  count = 9,
  spread = 260,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 30) return null;
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + random(`a${at}${i}`) * 0.6;
        const dist = interpolate(t, [0, 24], [0, spread * (0.6 + random(`d${at}${i}`) * 0.6)], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        const s = interpolate(t, [0, 6, 30], [0, 1, 0], clamp) * (18 + random(`s${at}${i}`) * 22);
        return (
          <svg
            key={i}
            viewBox="-10 -10 20 20"
            width={s * 2}
            height={s * 2}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * dist - s,
              top: y + Math.sin(a) * dist - s,
              filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color})`,
              transform: `rotate(${t * 6}deg)`,
            }}
          >
            <path d="M0 -10 Q1.2 -1.2 10 0 Q1.2 1.2 0 10 Q-1.2 1.2 -10 0 Q-1.2 -1.2 0 -10 Z" fill={color} />
          </svg>
        );
      })}
    </>
  );
};

// Glowing stroke that wipes in under a headline.
export const Underline: React.FC<{ at: number; width: number; color: string }> = ({ at, width, color }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div
      style={{
        width: width * p,
        height: 10,
        marginTop: 6,
        borderRadius: 6,
        background: color,
        boxShadow: `0 0 10px ${color}, 0 0 26px ${color}`,
        transform: "skewX(-20deg)",
      }}
    />
  );
};

// Small arrows drifting upward, used behind the growth word.
export const RisingArrows: React.FC<{ at: number; color: string; count?: number }> = ({ at, color, count = 14 }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const t = frame - at;
  if (t < 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const start = random(`ra${i}`) * 20;
        const life = t - start;
        if (life < 0) return null;
        const size = 30 + random(`rs${i}`) * 50;
        const yy = 1700 - life * (14 + random(`rv${i}`) * 10);
        const o = interpolate(life, [0, 6, 40], [0, 0.9, 0], clamp);
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            width={size}
            height={size}
            style={{
              position: "absolute",
              left: 60 + random(`rx${i}`) * (width - 160),
              top: yy,
              opacity: o,
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          >
            <path d="M10 2 L18 12 H13 V18 H7 V12 H2 Z" fill={color} />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

// Bars that grow one after another, for the competitor card.
export const GrowBars: React.FC<{ at: number; heights: number[]; color?: string }> = ({ at, heights, color = "white" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 22, height: Math.max(...heights) }}>
      {heights.map((h, i) => {
        const p = spring({ frame: frame - at - i * 4, fps, config: { damping: 14 } });
        return (
          <div
            key={i}
            style={{
              width: 54,
              height: h * p,
              opacity: p > 0.05 ? 1 : 0,
              borderRadius: 8,
              border: `5px solid ${color}`,
              background: "rgba(255,255,255,0.12)",
              boxShadow: `0 0 12px ${color}, 0 0 30px rgba(255,255,255,0.6)`,
            }}
          />
        );
      })}
    </div>
  );
};

// Scale-and-blur entrance for a full-frame card, like a zoom cut.
export const ZoomIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, 8], [1.25, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const b = interpolate(frame, [0, 8], [14, 0], clamp);
  return <AbsoluteFill style={{ transform: `scale(${s})`, filter: `blur(${b}px)` }}>{children}</AbsoluteFill>;
};
