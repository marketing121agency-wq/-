import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Dust, TallTitle } from "./Pieces";
import { Chrome3D } from "./Chrome3D";
import { PAPER, SILVER, sans, sec, tall } from "./tokens";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Overlays on the footage sit below the source caption (y ≈ 1070–1275), so they never cover the face.

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

export const MillionEdit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {/* Source footage as is: original colours, framing and burned-in captions. */}
    <OffthreadVideo src={staticFile("million-footage.mp4")} />

    {/* Opener title sits under the source caption, well clear of the face. */}
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

  </AbsoluteFill>
);

const OutFade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(frame, [len - 8, len], [1, 0], clamp) }}>{children}</AbsoluteFill>;
};
