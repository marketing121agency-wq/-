import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { INK, PAPER, SILVER, sans, tall } from "./tokens";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Huge condensed title that rises letter by letter; meant to sit behind the speaker cutout.
export const TallTitle: React.FC<{ text: string; top: number; size: number; delay?: number }> = ({ text, top, size, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: top }}>
      <div style={{ display: "flex", fontFamily: tall, fontWeight: 300, fontSize: size, lineHeight: 0.9, letterSpacing: size * 0.01 }}>
        {[...text].map((c, i) => {
          const p = spring({ frame: frame - delay - i * 2.5, fps, config: { damping: 200 }, durationInFrames: 22 });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                transform: `translateY(${(1 - p) * 120}px) scaleY(${1.18 + (1 - p) * 0.2})`,
                transformOrigin: "50% 100%",
                opacity: p,
                filter: `blur(${(1 - p) * 10}px)`,
                backgroundImage: SILVER,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {c}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Pre-rendered speaker cutout (RGBA webp per frame) laid over the title.
export const Cutout: React.FC<{ dir: string; count: number }> = ({ dir, count }) => {
  const frame = useCurrentFrame();
  return <Img src={staticFile(`${dir}/c${String(Math.min(frame, count - 1)).padStart(4, "0")}.webp`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
};

// White pill that pops in, then breaks into pixels, like the reference's yellow pill.
export const Pill: React.FC<{ text: string; at: number; out: number; y: number }> = ({ text, at, out, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 14 } });
  const dissolve = interpolate(frame, [out, out + 12], [0, 1], clamp);
  const cols = 22;
  const rows = 4;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: y }}>
      <div style={{ position: "relative", transform: `scale(${0.6 + 0.4 * p})`, opacity: p }}>
        <div
          style={{
            padding: "16px 34px",
            borderRadius: 999,
            background: PAPER,
            color: INK,
            fontFamily: sans,
            fontWeight: 650,
            fontSize: 40,
            letterSpacing: -0.5,
            boxShadow: "0 10px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.6) inset",
            display: "flex",
            alignItems: "center",
            gap: 14,
            maskImage: dissolve > 0 ? undefined : undefined,
            opacity: 1 - dissolve,
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: 7, background: INK }} />
          {text}
        </div>
        {dissolve > 0 && dissolve < 1 ? (
          <div style={{ position: "absolute", inset: -30, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {new Array(cols * rows).fill(0).map((_, i) => {
              const r = random(`px${i}`);
              const o = interpolate(dissolve, [r * 0.6, r * 0.6 + 0.4], [1, 0], clamp);
              return <div key={i} style={{ aspectRatio: "1", background: PAPER, opacity: o * (r > 0.35 ? 1 : 0), transform: `translateY(${-dissolve * r * 40}px)` }} />;
            })}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// Black glass panel that permanently covers the burned-in caption of the source clip.
export const CaptionPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      left: 64,
      right: 64,
      top: 1040,
      height: 262,
      borderRadius: 40,
      background: "linear-gradient(180deg, #161616, #060606)",
      border: "1px solid rgba(255,255,255,0.16)",
      boxShadow: "0 24px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

// One caption inside the panel; `hl` gets the brushed-silver treatment.
export const PanelLine: React.FC<{ text: string; hl?: string; delay?: number; size?: number }> = ({ text, hl, delay = 0, size = 58 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 9], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const parts = hl ? text.split(hl) : [text];
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px)`,
        filter: `blur(${(1 - p) * 6}px)`,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: -1.2,
        lineHeight: 1.15,
        color: PAPER,
        textAlign: "center",
      }}
    >
      {parts.map((s, i) => (
        <React.Fragment key={i}>
          {s}
          {i < parts.length - 1 ? (
            <span style={{ backgroundImage: SILVER, WebkitBackgroundClip: "text", color: "transparent", fontStyle: "italic", fontWeight: 800 }}>{hl}</span>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
};

// Fine grid and vignette that give the footage a designed, editorial feel.
export const GridVignette: React.FC<{ opacity?: number }> = ({ opacity = 0.12 }) => (
  <>
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "90px 90px",
      }}
    />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
  </>
);

// Slow drifting dust motes caught in a spotlight.
export const Dust: React.FC<{ count?: number; seed?: string }> = ({ count = 40, seed = "d" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}${k}${i}`);
        const x = (r("x") * width + frame * (r("vx") - 0.5) * 1.2 + width) % width;
        const y = (r("y") * height - frame * (0.3 + r("vy") * 0.8) + height * 2) % height;
        const s = 2 + r("s") * 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: s,
              background: "white",
              opacity: 0.25 + 0.5 * Math.abs(Math.sin(frame / 20 + i)),
              filter: `blur(${r("b") * 2}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
