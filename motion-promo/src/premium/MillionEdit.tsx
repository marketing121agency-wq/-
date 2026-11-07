import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CaptionPanel, Dust, GridVignette, PanelLine, TallTitle } from "./Pieces";
import { Chrome3D } from "./Chrome3D";
import { PAPER, SILVER, sans, sec, tall } from "./tokens";

const TOTAL = 1224; // 40.8 s
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Everything drawn over the footage stays at or below this line, so it never covers the face.
const FACE_SAFE_TOP = 1040;

// Slow push-in centred on the burned-in caption, so the covering panel stays aligned.
const PushIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, TOTAL], [1, 1.06]);
  return <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "50% 61.1%" }}>{children}</AbsoluteFill>;
};

const Studio: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 50% 40%, #2a2a2a 0%, #0d0d0d 55%, #050505 100%)" }}>{children}</AbsoluteFill>
);

const CutAway: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 7, len - 7, len], [0, 1, 1, 0], clamp);
  const s = interpolate(frame, [0, 10], [1.12, 1], clamp);
  const b = interpolate(frame, [0, 8], [12, 0], clamp);
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${s})`, filter: `blur(${b}px)` }}>{children}</AbsoluteFill>;
};

const Line: React.FC<{ at: number; children: React.ReactNode; size?: number; weight?: number; italic?: boolean }> = ({ at, children, size = 60, weight = 700, italic }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 20}px)`, filter: `blur(${(1 - p) * 6}px)`, fontFamily: sans, fontWeight: weight, fontStyle: italic ? "italic" : "normal", fontSize: size, letterSpacing: -1, color: PAPER, textAlign: "center" }}>
      {children}
    </div>
  );
};

// Silver counter that rolls up to $1 000 000, shown under the panel.
const MillionCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [6, 66], [0, 1_000_000], { ...clamp, easing: Easing.out(Easing.cubic) });
  const appear = interpolate(frame, [0, 8], [0, 1], clamp);
  const label = Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 1350, opacity: appear }}>
      <div style={{ fontFamily: tall, fontWeight: 300, fontSize: 210, lineHeight: 1, backgroundImage: SILVER, WebkitBackgroundClip: "text", color: "transparent", fontVariantNumeric: "tabular-nums" }}>
        ${label}
      </div>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 44, color: "rgba(244,243,239,0.7)", marginTop: 8 }}>19 yoshda</div>
    </AbsoluteFill>
  );
};

type Cue = [number, string, number];
const CUES: Cue[] = [
  [0.1, "whoosh-long.wav", 0.3],
  [6.8, "whoosh-short.wav", 0.35],
  [7.25, "maximize_004.ogg", 0.3],
  [9.75, "whoosh-short.wav", 0.25],
  [14.0, "maximize_006.ogg", 0.25],
  [16.1, "confirmation_002.ogg", 0.28],
  [20.8, "whoosh-short.wav", 0.35],
  [21.25, "maximize_004.ogg", 0.3],
  [23.75, "whoosh-short.wav", 0.25],
  [37.45, "whoosh-long.wav", 0.32],
  [38.0, "impactSoft_medium_000.ogg", 0.4],
];

export const MillionEdit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <PushIn>
      <OffthreadVideo src={staticFile("million-footage.mp4")} style={{ filter: "saturate(0.12) contrast(1.12) brightness(0.95)" }} />
    </PushIn>
    <GridVignette opacity={0.07} />

    {/* Opener title sits under the panel, well clear of the face. */}
    <Sequence name="Opener title" durationInFrames={sec(3.6)}>
      <OutFade len={sec(3.6)}>
        <TallTitle text="19 YOSHDA" top={1340} size={250} delay={6} />
      </OutFade>
    </Sequence>

    <Sequence name="Counter" from={sec(13.6)} durationInFrames={sec(18.6) - sec(13.6)}>
      <OutFade len={sec(18.6) - sec(13.6)}>
        <MillionCounter />
      </OutFade>
    </Sequence>

    {/* Permanent panel over the burned-in caption; its top is the face-safe line. */}
    <div style={{ position: "absolute", inset: 0, top: FACE_SAFE_TOP - 1040 }}>
      <CaptionPanel>
        <PanelLine text="$1 000 000 ni" hl="$1 000 000" delay={4} size={64} />
        <PanelLine text="19 yoshimda ushlaganman…" delay={12} size={58} />
      </CaptionPanel>
    </div>

    <Sequence name="3D · $1 000 000" from={sec(7.0)} durationInFrames={sec(10.0) - sec(7.0)}>
      <CutAway len={sec(3)}>
        <Studio>
          <Chrome3D text="$1 000 000" coins maxWidth={2.9} y={0.3} />
          <Dust />
          <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 420 }}>
            <Line at={10}>
              19 yoshda <span style={{ fontStyle: "italic", fontWeight: 300 }}>qo‘limda</span>
            </Line>
          </AbsoluteFill>
        </Studio>
      </CutAway>
    </Sequence>

    <Sequence name="3D · 19" from={sec(21.0)} durationInFrames={sec(24.0) - sec(21.0)}>
      <CutAway len={sec(3)}>
        <Studio>
          <Chrome3D text="19" maxWidth={2.0} y={0.4} />
          <Dust seed="n" />
          <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 420 }}>
            <Line at={10}>
              yoshda <span style={{ fontStyle: "italic", fontWeight: 300 }}>million dollar</span>
            </Line>
          </AbsoluteFill>
        </Studio>
      </CutAway>
    </Sequence>

    {/* Outro replaces the source's gold end card with the same message in black and white. */}
    <Sequence name="Outro" from={sec(37.6)}>
      <InFade>
        <Studio>
          <Chrome3D text="1+1" maxWidth={2.4} y={1.2} />
          <Dust seed="o" />
          <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 470, gap: 8 }}>
            <Line at={8} size={96} weight={800}>
              TO‘LIQ VIDEONI
            </Line>
            <Line at={16} size={50} weight={600}>
              YouTube’dagi 1+1 Podcast
            </Line>
            <Line at={22} size={50} weight={300} italic>
              kanalida ko‘rishingiz mumkin
            </Line>
          </AbsoluteFill>
        </Studio>
      </InFade>
    </Sequence>

    {CUES.map(([t, file, volume], i) => (
      <Sequence key={i} name={`sfx ${file}`} from={sec(t)} durationInFrames={60} layout="none">
        <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

const OutFade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(frame, [len - 8, len], [1, 0], clamp) }}>{children}</AbsoluteFill>;
};

const InFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(frame, [0, 8], [0, 1], clamp) }}>{children}</AbsoluteFill>;
};
