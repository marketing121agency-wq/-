import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";

const sans = "InterUpright";
loadFont({ family: sans, url: staticFile("fonts/inter.woff2"), weight: "100 900" });

const HL = "#3ddc84";

export type SubLine = { from: number; to: number; text: string; hl?: string };

// Frosted-glass caption card, as in the ST Group reference: gentle fade and rise, nothing else.
const GlassCard: React.FC<{ line: SubLine; duration: number }> = ({ line, duration }) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [duration - 5, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const parts = line.hl ? line.text.split(line.hl) : [line.text];
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 330 }}>
      <div
        style={{
          opacity: inP * out,
          transform: `translateY(${(1 - inP) * 28}px)`,
          maxWidth: 900,
          padding: "30px 44px",
          borderRadius: 44,
          background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(20,20,20,0.28))",
          border: "1.5px solid rgba(255,255,255,0.38)",
          backdropFilter: "blur(26px) saturate(1.4)",
          WebkitBackdropFilter: "blur(26px) saturate(1.4)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.35)",
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 58,
          lineHeight: 1.18,
          letterSpacing: -1,
          color: "white",
          textAlign: "center",
          textShadow: "0 2px 10px rgba(0,0,0,0.25)",
        }}
      >
        {parts.map((p, i) => (
          <React.Fragment key={i}>
            {p}
            {i < parts.length - 1 ? <span style={{ color: HL }}>{line.hl}</span> : null}
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const GlassSubsEdit: React.FC<{ src: string; lines: SubLine[] }> = ({ src, lines }) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <OffthreadVideo src={staticFile(src)} />
    {lines.map((l, i) => {
      const from = Math.round(l.from * 30);
      const dur = Math.round(l.to * 30) - from;
      return (
        <Sequence key={i} name={l.text} from={from} durationInFrames={dur}>
          <GlassCard line={l} duration={dur} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

// Best-guess transcripts: speech recognition was unreliable on these clips.
export const cityLines: SubLine[] = [
  { from: 0.15, to: 2.0, text: "Mana shu savdo markazi", hl: "savdo markazi" },
  { from: 2.0, to: 4.0, text: "tashqaridan ko‘rinishi" },
  { from: 4.0, to: 6.0, text: "zo‘r, juda yarqirab turibdi", hl: "zo‘r" },
  { from: 6.0, to: 8.5, text: "Lekin hozir bu yer — ofis", hl: "ofis" },
  { from: 8.5, to: 11.15, text: "Siz nima deb o‘ylaysiz?" },
  { from: 11.15, to: 13.1, text: "Qaysi savdo markazlar" },
  { from: 13.1, to: 15.1, text: "formatini o‘zgartiryapti", hl: "formatini" },
  { from: 15.1, to: 17.6, text: "zamonaviy qilib qo‘yishgan", hl: "zamonaviy" },
];

export const mallLines: SubLine[] = [
  { from: 0.1, to: 2.4, text: "Shanxayda bitta binoni ko‘rdim", hl: "Shanxayda" },
  { from: 2.4, to: 6.4, text: "ofislarga aylantirib qo‘yishibdi", hl: "ofislarga" },
  { from: 6.4, to: 8.9, text: "Hammasi savdo markazi edi", hl: "savdo markazi" },
  { from: 8.9, to: 12.85, text: "Endi uni nima qilib o‘zgartirishibdi?", hl: "o‘zgartirishibdi" },
  { from: 20.7, to: 24.65, text: "Agar sizga qiziq bo‘lsa", hl: "qiziq" },
  { from: 24.65, to: 26.65, text: "hammasi shu yerda" },
  { from: 26.65, to: 28.65, text: "Zo‘r-zo‘r savdo markazlar bor", hl: "Zo‘r-zo‘r" },
  { from: 28.65, to: 31.2, text: "shaharda bunaqasi ko‘p" },
];
