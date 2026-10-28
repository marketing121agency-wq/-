import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Bundled locally so rendering never depends on reaching Google Fonts.
export const condensed = "Anton";
export const inter = "InterItalic";
loadFont({ family: condensed, url: staticFile("fonts/anton.woff2") });
loadFont({ family: inter, url: staticFile("fonts/inter-italic.woff2"), style: "italic", weight: "100 900" });

export const YELLOW = "#ffe02a";
export const GREEN = "#3dff3a";

export const glow = (color: string, strength = 1) =>
  [
    // Soft dark halo keeps text readable over the white shirt.
    "0 2px 4px rgba(0,0,0,0.35)",
    "0 3px 18px rgba(0,0,0,0.55)",
    `0 0 ${6 * strength}px ${color}`,
    `0 0 ${18 * strength}px ${color}`,
    `0 0 ${42 * strength}px ${color}aa`,
  ].join(", ");

// Fade the whole block out at the end of its scene.
export const useExit = (duration: number, length = 8) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [duration - length, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// Thin italic caption: letters fade in left to right, like a soft wipe.
export const SubText: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  align?: "left" | "center" | "right";
}> = ({ text, delay = 0, size = 48, align = "left" }) => {
  const frame = useCurrentFrame();
  const chars = [...text];
  return (
    <div
      style={{
        fontFamily: inter,
        fontWeight: 300,
        fontStyle: "italic",
        fontSize: size,
        color: "white",
        letterSpacing: -1,
        textAlign: align,
        whiteSpace: "pre",
        textShadow: glow("rgba(255,255,255,0.55)", 0.6),
      }}
    >
      {chars.map((c, i) => {
        const o = interpolate(frame - delay - i * 0.7, [0, 7], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span key={i} style={{ opacity: o, filter: `blur(${(1 - o) * 6}px)` }}>
            {c}
          </span>
        );
      })}
    </div>
  );
};

// Headline whose letters swing in along an arc, as in the reference.
export const ArcText: React.FC<{
  text: string;
  delay?: number;
  style: React.CSSProperties;
  glowColor: string;
  radius?: number;
  stagger?: number;
}> = ({ text, delay = 0, style, glowColor, radius = 520, stagger = 1.6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = [...text];
  return (
    <div style={{ display: "flex", whiteSpace: "pre", ...style, textShadow: glow(glowColor) }}>
      {chars.map((c, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 18, stiffness: 120, mass: 0.7 },
        });
        const theta = (1 - p) * 1.25; // radians still left to travel
        const x = Math.sin(theta) * radius;
        const y = radius - Math.cos(theta) * radius;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(p, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translate(${x}px, ${y}px) rotate(${theta}rad) scale(${0.6 + 0.4 * p})`,
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
};

// Digits pop in one by one, each growing from small with a green glow.
export const PopNumber: React.FC<{ text: string; delay?: number; size?: number; color?: string; stagger?: number }> = ({
  text,
  delay = 0,
  size = 300,
  color = GREEN,
  stagger = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        fontFamily: condensed,
        fontSize: size,
        lineHeight: 1,
        color,
        whiteSpace: "pre",
        textShadow: glow(color, 1.1),
      }}
    >
      {[...text].map((c, i) => {
        const p = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 12, stiffness: 160 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(p, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
              transform: `scale(${0.25 + 0.75 * p})`,
              transformOrigin: "50% 100%",
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
};

// Night-city stand-in: dark backdrop with drifting out-of-focus lights.
export const Bokeh: React.FC<{ seed: string; hues: string[] }> = ({ seed, hues }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const zoom = interpolate(frame, [0, 150], [1.08, 1], { easing: Easing.out(Easing.quad), extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1a1408 0%, #050403 75%)" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {new Array(18).fill(0).map((_, i) => {
          const r = (k: string) => random(`${seed}-${i}-${k}`);
          const size = 60 + r("s") * 260;
          const x = r("x") * width + Math.sin(frame / 50 + i) * 20;
          const y = r("y") * height * 0.75 + Math.cos(frame / 60 + i) * 16;
          const flicker = 0.35 + 0.25 * Math.sin(frame / 12 + i * 2);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
                borderRadius: "50%",
                background: hues[i % hues.length],
                opacity: flicker * (0.25 + r("o") * 0.45),
                filter: `blur(${10 + r("b") * 30}px)`,
              }}
            />
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

// Orange gradient card with a thin grid, as in the "DIGITAL MARKETING" shot.
export const GridCard: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = frame * 0.6;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #1c1000 0%, #6b3c00 45%, #f29a00 100%)" }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,220,160,0.28) 2px, transparent 2px), linear-gradient(90deg, rgba(255,220,160,0.28) 2px, transparent 2px)",
          backgroundSize: "135px 135px",
          backgroundPosition: `0 ${shift}px`,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};
