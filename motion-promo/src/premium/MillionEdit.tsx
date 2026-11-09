import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { Dust, TallTitle } from "./Pieces";
import { Chrome3D } from "./Chrome3D";
import { PAPER, SILVER, sec } from "./tokens";

// Full character sets (with ş, ğ, ö, ç) for text in the new Uzbek Latin alphabet.
const tallFull = "OswaldFull";
const sansFull = "InterFull";
const captionFont = "NotoSansFull";
const goldFont = "AntonFull";
loadFont({ family: tallFull, url: staticFile("fonts/oswald-full.ttf"), weight: "300" });
loadFont({ family: sansFull, url: staticFile("fonts/inter-full.ttf"), weight: "700" });
loadFont({ family: captionFont, url: staticFile("fonts/notosans-full.ttf"), weight: "700" });
loadFont({ family: goldFont, url: staticFile("fonts/anton-full.ttf"), weight: "400" });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The source's own caption ends here, when its gold end card begins.
const OUTRO_AT = 37.85;

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

const Line: React.FC<{ at: number; children: React.ReactNode; size?: number }> = ({ at, children, size = 60 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 20}px)`, filter: `blur(${(1 - p) * 6}px)`, fontFamily: sansFull, fontWeight: 700, fontSize: size, letterSpacing: -1, color: PAPER, textAlign: "center" }}>
      {children}
    </div>
  );
};

// Silver counter that rolls up to $1 000 000, shown under the caption.
const MillionCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [6, 66], [0, 1_000_000], { ...clamp, easing: Easing.out(Easing.cubic) });
  const appear = interpolate(frame, [0, 8], [0, 1], clamp);
  const label = Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 1350, opacity: appear }}>
      <div style={{ fontFamily: tallFull, fontWeight: 300, fontSize: 210, lineHeight: 1, backgroundImage: SILVER, WebkitBackgroundClip: "text", color: "transparent", fontVariantNumeric: "tabular-nums" }}>
        ${label}
      </div>
      <div style={{ fontFamily: sansFull, fontWeight: 700, fontSize: 44, color: "rgba(244,243,239,0.7)", marginTop: 8 }}>19 yoşda</div>
    </AbsoluteFill>
  );
};

// Replica of the source's burned-in caption box, re-typed in the new alphabet. It sits exactly over the original.
const SourceCaption: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 74,
      top: 1066,
      width: 932,
      height: 214,
      background: "rgb(22, 12, 12)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: captionFont,
      fontWeight: 700,
      fontSize: 66,
      lineHeight: 1.16,
      letterSpacing: -0.5,
      color: "#ffffff",
    }}
  >
    <div>$1000000 ni</div>
    <div>19 yoşimda uşlaganman···</div>
  </div>
);

// Gold end card rebuilt word by word, over blurred footage from earlier in the clip (no old text in it).
const GOLD = "linear-gradient(180deg, #fff3cf 0%, #f4d58f 45%, #d4a24c 100%)";
const GoldWord: React.FC<{ at: number; children: string; size: number }> = ({ at, children, size }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, 9], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <span
      style={{
        display: "inline-block",
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
        fontFamily: goldFont,
        fontSize: size,
        lineHeight: 1.05,
        backgroundImage: GOLD,
        WebkitBackgroundClip: "text",
        color: "transparent",
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.45))",
        margin: `0 ${size * 0.12}px -${size * 0.14}px`,
        paddingBottom: size * 0.14,
      }}
    >
      {children}
    </span>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 8], [0, 1], clamp);
  const t = (s: number) => sec(s) - sec(OUTRO_AT);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ filter: "blur(28px) brightness(0.55)", transform: "scale(1.08)" }}>
        <OffthreadVideo src={staticFile("million-footage.mp4")} trimBefore={sec(OUTRO_AT - 3.5)} muted />
        {/* That footage still carries the old caption; cover it with the new one before blurring. */}
        <SourceCaption />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 845 }}>
        <div>
          <GoldWord at={t(38.15)} size={160}>TÖLIQ</GoldWord>
          <GoldWord at={t(38.35)} size={160}>VIDEONI</GoldWord>
        </div>
        <div style={{ marginTop: 6 }}>
          <GoldWord at={t(38.95)} size={66}>YOUTUBE’DA</GoldWord>
          <GoldWord at={t(39.1)} size={66}>1+1</GoldWord>
          <GoldWord at={t(39.25)} size={66}>PODCAST</GoldWord>
        </div>
        <div>
          <GoldWord at={t(39.4)} size={66}>KANALIDA</GoldWord>
          <GoldWord at={t(39.55)} size={66}>KÖRIŞINGIZ</GoldWord>
          <GoldWord at={t(39.75)} size={66}>MUMKIN</GoldWord>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MillionEdit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {/* Source footage as is: original colours and framing. */}
    <OffthreadVideo src={staticFile("million-footage.mp4")} />

    <Sequence name="Caption (new alphabet)" durationInFrames={sec(OUTRO_AT) + 10}>
      <SourceCaption />
    </Sequence>

    {/* Opener title sits under the caption, well clear of the face. */}
    <Sequence name="Opener title" durationInFrames={sec(3.6)}>
      <OutFade len={sec(3.6)}>
        <TallTitle text="19 YOŞDA" top={1340} size={250} delay={6} font={tallFull} />
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
          <Chrome3D text="$1 000 000" money="stack" maxWidth={2.7} y={1.35} />
          <Dust />
          <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 420 }}>
            <Line at={10}>19 yoşda qölimda</Line>
          </AbsoluteFill>
        </Studio>
      </CutAway>
    </Sequence>

    <Sequence name="End card (new alphabet)" from={sec(OUTRO_AT)}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);

const OutFade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(frame, [len - 8, len], [1, 0], clamp) }}>{children}</AbsoluteFill>;
};
