import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";

const sans = "InterFullSvoy";
loadFont({ family: sans, url: staticFile("fonts/inter-full.ttf"), weight: "700" });

const sec = (s: number) => Math.round(s * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const INK = "#ffffff";
const CARD_BG = "rgba(18,18,18,0.88)";

// All cards sit in the lower part of the frame, below the speaker's face.
const CARD_TOP = 1340;

type Pick = { rank: number; name: string; logo: string; from: number; to: number };
const PICKS: Pick[] = [
  { rank: 3, name: "Claude", logo: "logos/claude-color.svg", from: 3.1, to: 21.6 },
  { rank: 2, name: "Gemini", logo: "logos/gemini-color.svg", from: 21.6, to: 41.4 },
  { rank: 1, name: "NotebookLM", logo: "logos/notebooklm.svg", from: 41.4, to: 75.0 },
];

const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 16 });
};

// Logos sit on a white tile so dark marks (NotebookLM) stay visible on the dark card.
const LogoTile: React.FC<{ src: string; size: number; style?: React.CSSProperties }> = ({ src, size, style }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
    <Img src={staticFile(src)} style={{ width: size * 0.66, height: size * 0.66 }} />
  </div>
);

const Card: React.FC<{ children: React.ReactNode; len: number; small?: boolean }> = ({ children, len }) => {
  const frame = useCurrentFrame();
  const p = useEnter();
  const out = interpolate(frame, [len - 8, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: CARD_TOP }}>
      <div
        style={{
          opacity: p * out,
          transform: `translateY(${(1 - p) * 40}px)`,
          background: CARD_BG,
          backdropFilter: "blur(12px)",
          borderRadius: 36,
          padding: "30px 46px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
          display: "flex",
          alignItems: "center",
          gap: 30,
          fontFamily: sans,
          fontWeight: 700,
          color: INK,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

// Rank card shown when each AI is announced.
const PickCard: React.FC<{ pick: Pick; len: number }> = ({ pick, len }) => {
  const logoIn = useEnter(5);
  return (
    <Card len={len}>
      <div style={{ fontSize: 120, lineHeight: 1, color: "#7d7d7d", letterSpacing: -4 }}>{pick.rank}</div>
      <div style={{ width: 2, height: 120, background: "#3a3a3a" }} />
      <LogoTile src={pick.logo} size={140} style={{ transform: `scale(${0.6 + 0.4 * logoIn})`, opacity: logoIn }} />
      <div style={{ fontSize: 76, letterSpacing: -2 }}>{pick.name}</div>
    </Card>
  );
};

// Small chip that stays at the bottom while the speaker talks about that AI.
const Chip: React.FC<{ pick: Pick; len: number }> = ({ pick, len }) => {
  const frame = useCurrentFrame();
  const p = useEnter();
  const out = interpolate(frame, [len - 8, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 230 }}>
      <div
        style={{
          opacity: p * out,
          transform: `translateY(${(1 - p) * 20}px)`,
          background: CARD_BG,
          borderRadius: 999,
          padding: "14px 30px 14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 40,
          color: INK,
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        }}
      >
        <LogoTile src={pick.logo} size={56} />
        <span style={{ color: "#8a8a8a" }}>#{pick.rank}</span>
        {pick.name}
      </div>
    </AbsoluteFill>
  );
};

const Intro: React.FC<{ len: number }> = ({ len }) => (
  <Card len={len}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ fontSize: 64, letterSpacing: -2 }}>TOP 3 sun’iy intellekt</div>
      <div style={{ display: "flex", gap: 26 }}>
        {PICKS.map((p, i) => (
          <IntroLogo key={p.name} src={p.logo} delay={6 + i * 4} />
        ))}
      </div>
    </div>
  </Card>
);

const IntroLogo: React.FC<{ src: string; delay: number }> = ({ src, delay }) => {
  const p = useEnter(delay);
  // Blurred in the hook so the three picks stay a surprise.
  return <LogoTile src={src} size={96} style={{ opacity: p, transform: `scale(${0.6 + 0.4 * p})`, filter: "blur(9px)" }} />;
};

const Outro: React.FC<{ len: number }> = ({ len }) => (
  <Card len={len}>
    <div style={{ fontSize: 54, letterSpacing: -1, textAlign: "center", lineHeight: 1.2 }}>
      Sizda qaysi biri
      <br />
      <span style={{ color: "#9a9a9a" }}>1-o‘rinda?</span> Izohda yozing
    </div>
  </Card>
);

export const SvoyEdit: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const CARD_LEN = sec(5);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo src={staticFile("svoy-footage.mov")} />

      <Sequence name="Intro" durationInFrames={sec(3.0)}>
        <Intro len={sec(3.0)} />
      </Sequence>

      {PICKS.map((p) => (
        <React.Fragment key={p.name}>
          <Sequence name={`#${p.rank} ${p.name}`} from={sec(p.from)} durationInFrames={CARD_LEN}>
            <PickCard pick={p} len={CARD_LEN} />
          </Sequence>
          <Sequence name={`chip ${p.name}`} from={sec(p.from) + CARD_LEN} durationInFrames={sec(p.to) - sec(p.from) - CARD_LEN}>
            <Chip pick={p} len={sec(p.to) - sec(p.from) - CARD_LEN} />
          </Sequence>
        </React.Fragment>
      ))}

      <Sequence name="Outro" from={sec(75.0)} durationInFrames={durationInFrames - sec(75.0)}>
        <Outro len={durationInFrames - sec(75.0)} />
      </Sequence>
    </AbsoluteFill>
  );
};

