import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Card3D } from "./Card3D";
import { CaptionPanel, Cutout, Dust, GridVignette, PanelLine, Pill, TallTitle } from "./Pieces";
import { Question3D } from "./Question3D";
import { INK, PAPER, sans, sec, tall } from "./tokens";

const TOTAL = 1032; // 34.4 s

// Slow push-in centred on the burned-in caption, so the covering panel stays aligned.
const PushIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, TOTAL], [1, 1.07]);
  return <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "50% 61.1%" }}>{children}</AbsoluteFill>;
};

const Studio: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 50% 38%, #2a2a2a 0%, #0d0d0d 55%, #050505 100%)" }}>{children}</AbsoluteFill>
);

// Cut-away wrapper: zooms in from slightly larger with a blur, and fades out at the end.
const CutAway: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 7, len - 7, len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = interpolate(frame, [0, 10], [1.12, 1], { extrapolateRight: "clamp" });
  const b = interpolate(frame, [0, 8], [12, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${s})`, filter: `blur(${b}px)` }}>{children}</AbsoluteFill>;
};

const BigIndex: React.FC<{ n: string; label: string }> = ({ n, label }) => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
    <div style={{ fontFamily: tall, fontWeight: 200, fontSize: 260, lineHeight: 1, color: PAPER, opacity: 0.9 }}>{n}</div>
    <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 44, color: "rgba(244,243,239,0.7)", marginTop: 6 }}>{label}</div>
  </AbsoluteFill>
);

const BottomLine: React.FC<{ bold: string; light: string }> = ({ bold, light }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 380 }}>
    <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 60, color: PAPER, letterSpacing: -1 }}>
      {bold} <span style={{ fontStyle: "italic", fontWeight: 300 }}>{light}</span>
    </div>
  </AbsoluteFill>
);

// Raised white key with a press-down, for the closing call to action.
const SubscribeKey: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 13 } });
  const press = interpolate(frame, [26, 30, 36], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 860 }}>
      <div style={{ transform: `translateY(${(1 - p) * 60}px) scale(${0.8 + 0.2 * p})`, opacity: p }}>
        <div
          style={{
            padding: "26px 64px",
            borderRadius: 30,
            background: "linear-gradient(180deg, #ffffff 0%, #e9e8e4 55%, #d2d1cc 100%)",
            boxShadow: `0 ${14 - press * 10}px 0 #8f8e8a, 0 ${30 - press * 18}px 50px rgba(0,0,0,0.55), inset 0 2px 0 #ffffff`,
            transform: `translateY(${press * 10}px)`,
            fontFamily: sans,
            fontWeight: 800,
            fontSize: 52,
            letterSpacing: 1,
            color: INK,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span style={{ width: 22, height: 22, borderRadius: 11, background: INK }} />
          OBUNA BO‘LING
        </div>
      </div>
    </AbsoluteFill>
  );
};

type Cue = [number, string, number];
const CUES: Cue[] = [
  [0.1, "whoosh-long.wav", 0.3],
  [1.4, "glass_002.ogg", 0.3],
  [3.4, "glass_001.ogg", 0.3],
  [4.0, "whoosh-short.wav", 0.35],
  [4.35, "maximize_004.ogg", 0.3],
  [6.95, "whoosh-short.wav", 0.25],
  [15.8, "whoosh-short.wav", 0.35],
  [16.15, "maximize_006.ogg", 0.3],
  [18.75, "whoosh-short.wav", 0.25],
  [30.2, "pluck_002.ogg", 0.35],
  [31.15, "confirmation_002.ogg", 0.3],
];

export const PremiumEdit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <PushIn>
      <OffthreadVideo src={staticFile("hr-footage.mp4")} style={{ filter: "saturate(0.55) contrast(1.08) brightness(0.92)" }} />
      <Sequence name="Title behind speaker" durationInFrames={126}>
        <TallTitle text="XODIM" top={150} size={360} delay={4} />
        <Cutout dir="hr-cutout" count={126} />
      </Sequence>
    </PushIn>
    <GridVignette opacity={0.08} />
    <Sequence name="Pill" durationInFrames={126}>
      <Pill text="ishdan haydalishi aniq" at={sec(1.4)} out={sec(3.4)} y={905} />
    </Sequence>

    {/* Permanent panel over the source clip's burned-in caption. */}
    <CaptionPanel>
      <Sequence name="Hook" durationInFrames={sec(30.2)} layout="none">
        <PanelLine text="Ushbu narsa bo‘lmasa" delay={2} />
        <PanelLine text="xodim ishdan haydaladi" hl="haydaladi" delay={10} />
      </Sequence>
      <Sequence name="CTA text" from={sec(30.2)} layout="none">
        <PanelLine text="Foydali bo‘lsa —" delay={0} size={52} />
        <PanelLine text="do‘stlaringizga yuboring" hl="yuboring" delay={8} size={52} />
      </Sequence>
    </CaptionPanel>

    <Sequence name="01 · 3D card" from={sec(4.2)} durationInFrames={sec(3)}>
      <CutAway len={sec(3)}>
        <Studio>
          <BigIndex n="01" label="xodim" />
          <Card3D title="XODIM" subtitle="Bo‘lim: Savdo" />
          <Dust />
          <BottomLine bold="ishdan" light="haydalishi aniq" />
        </Studio>
      </CutAway>
    </Sequence>

    <Sequence name="02 · 3D question" from={sec(16)} durationInFrames={sec(3)}>
      <CutAway len={sec(3)}>
        <Studio>
          <BigIndex n="02" label="sabab" />
          <Question3D />
          <Dust seed="q" />
          <BottomLine bold="Ushbu narsa" light="nima?" />
        </Studio>
      </CutAway>
    </Sequence>

    <Sequence name="CTA key" from={sec(30.2)}>
      <SubscribeKey />
    </Sequence>

    {CUES.map(([t, file, volume], i) => (
      <Sequence key={i} name={`sfx ${file}`} from={sec(t)} durationInFrames={60} layout="none">
        <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

