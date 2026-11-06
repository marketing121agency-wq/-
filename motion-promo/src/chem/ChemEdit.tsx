import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Cutout, Dust, TallTitle } from "../premium/Pieces";
import { sans, sec, tall } from "../premium/tokens";
import { Lab3D } from "./Lab3D";
import { BLUE, GRAD, GRAD_V, GREEN, ICE, NAVY } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const GradText: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; grad?: string }> = ({ children, style, grad = GRAD }) => (
  <span style={{ backgroundImage: grad, WebkitBackgroundClip: "text", color: "transparent", ...style }}>{children}</span>
);

// A line that blurs up into place.
const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 22}px)`, filter: `blur(${(1 - p) * 6}px)`, ...style }}>{children}</div>;
};

const Hl: React.FC<{ text: string; hl?: string }> = ({ text, hl }) => {
  if (!hl || !text.includes(hl)) return <>{text}</>;
  const [a, b] = text.split(hl);
  return (
    <>
      {a}
      <GradText style={{ fontWeight: 800 }}>{hl}</GradText>
      {b}
    </>
  );
};

// Opaque lab-navy card that permanently covers the source clip's burned-in captions.
const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 868, height: 568, padding: 3, borderRadius: 46, background: GRAD }}>
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 43,
        background: `radial-gradient(ellipse at 50% 0%, #0d2a44 0%, ${NAVY} 70%)`,
        position: "relative",
        overflow: "hidden",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      <HexPattern opacity={0.07} />
      {children}
    </div>
  </div>
);

const HexPattern: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity }}>
    <defs>
      <pattern id="hex" width="56" height="97" patternUnits="userSpaceOnUse">
        <path d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L28 97" fill="none" stroke="#9fd8ff" strokeWidth="1.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
  </svg>
);

type Sub = { from: number; to: number; text: string; hl?: string; index?: string; textAt?: number; lift?: number };

const SUBS: Sub[] = [
  { from: 7.95, to: 8.45, text: "Nega talaba qiynaladi?", hl: "qiynaladi?" },
  { from: 8.45, to: 10.3, text: "Buning 3 ta sababi bor", hl: "3 ta sababi" },
  { from: 10.3, to: 12.75, index: "01", textAt: 10.9, text: "Ta’limdagi uzviylikning buzilganligi", hl: "uzviylikning" },
  { from: 18.1, to: 20.85, index: "02", textAt: 19.0, text: "Bolalar test ishlayotgan paytda", hl: "test" },
  { from: 20.85, to: 23.25, text: "qaysinisi to‘g‘ri javob ekanligini biladi", hl: "to‘g‘ri javob" },
  { from: 28.45, to: 32.85, index: "03", textAt: 29.5, text: "Amalda qo‘llash", hl: "Amalda" },
  { from: 36.35, to: 38.35, text: "Eritmaning pH qiymatini oladigan bo‘lsak", hl: "pH", lift: 150 },
  { from: 38.35, to: 41.55, text: "Organizmdagi pH qiymatini oladigan bo‘lsak", hl: "pH", lift: 150 },
  { from: 41.55, to: 43.0, text: "uni pH’ini topishi mumkin", hl: "pH’ini", lift: 150 },
  { from: 43.0, to: 47.4, text: "Qanday amaliy ahamiyati borligi haqida tushuncha yo‘q", hl: "amaliy ahamiyati" },
  { from: 47.4, to: 48.95, text: "qanaqadir quruq masalalar,", hl: "quruq" },
  { from: 48.95, to: 50.35, text: "yoki quruq testlar ishlatilmaydi", hl: "ishlatilmaydi" },
  { from: 50.35, to: 50.95, text: "u yerda asosan" },
  { from: 50.95, to: 52.35, text: "mohiyatini tushunish kerak", hl: "mohiyatini" },
  { from: 52.35, to: 53.45, text: "va ahamiyatini tushunish kerak", hl: "ahamiyatini" },
  { from: 53.45, to: 58.93, text: "Kimyoni tushunib o‘rganing — obuna bo‘ling", hl: "obuna bo‘ling", lift: 170 },
];

const SubView: React.FC<{ s: Sub }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 13 } });
  const textDelay = s.textAt ? sec(s.textAt) - sec(s.from) : 1;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 60px", paddingTop: s.lift ?? 0 }}>
      {s.index ? (
        <div style={{ transform: `scale(${0.6 + 0.4 * pop})`, opacity: pop, marginBottom: 6 }}>
          <GradText grad={GRAD_V} style={{ fontFamily: tall, fontWeight: 300, fontSize: 190, lineHeight: 1 }}>
            {s.index}
          </GradText>
        </div>
      ) : null}
      <Rise delay={textDelay} style={{ fontFamily: sans, fontWeight: 700, fontSize: s.text.length > 34 ? 56 : 64, lineHeight: 1.15, letterSpacing: -1.2, color: ICE, textAlign: "center" }}>
        <Hl text={s.text} hl={s.hl} />
      </Rise>
    </AbsoluteFill>
  );
};

// Full-screen lab cut-away: navy studio, hex grid, a 3D model, an index and timed lines.
const CutAway: React.FC<{ len: number; index?: string; label?: string; children?: React.ReactNode; lines: { at: number; text: string; hl?: string }[]; variant: "ring" | "broken" | "answers" | "flask"; y?: number; title?: React.ReactNode }> = ({
  len,
  index,
  label,
  lines,
  variant,
  y,
  title,
  children,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 7, len - 7, len], [0, 1, 1, 0], clamp);
  const s = interpolate(frame, [0, 10], [1.1, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${s})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 50% at 50% 42%, #0f3352 0%, ${NAVY} 60%, #020a12 100%)` }} />
      <HexPattern opacity={0.06} />
      {index ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
          <GradText grad={GRAD_V} style={{ fontFamily: tall, fontWeight: 200, fontSize: 230, lineHeight: 1 }}>
            {index}
          </GradText>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 42, color: "rgba(238,248,255,0.65)", marginTop: 4 }}>{label}</div>
        </AbsoluteFill>
      ) : null}
      {title}
      <Lab3D variant={variant} y={y} />
      <Dust count={34} seed={variant} />
      {children}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 300, gap: 6 }}>
        {lines.map((l) => (
          <Rise key={l.text} delay={l.at} style={{ fontFamily: sans, fontWeight: 700, fontSize: 62, letterSpacing: -1.2, color: ICE, textAlign: "center" }}>
            <Hl text={l.text} hl={l.hl} />
          </Rise>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// pH scale above the panel: the marker settles at neutral, then moves to blood's ~7.4.
const PhScale: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [0, 10], [0, 1], clamp);
  const toBody = interpolate(frame, [sec(2.0), sec(2.6)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ph = interpolate(frame, [4, 24], [0, 7], { ...clamp, easing: Easing.out(Easing.cubic) }) + toBody * 0.4;
  const x = (ph / 14) * 820;
  return (
    <div style={{ position: "absolute", left: 130, top: 960, width: 820, opacity: appear }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontWeight: 700, fontSize: 30, color: "rgba(238,248,255,0.8)", marginBottom: 10 }}>
        <span>0</span>
        <span>pH</span>
        <span>14</span>
      </div>
      <div
        style={{
          height: 28,
          borderRadius: 14,
          background: "linear-gradient(90deg, #ff5a5a, #ffb547 25%, #f4f06a 40%, #2ee59d 50%, #46e0ff 65%, #3fa9ff 80%, #6b5cff)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
        }}
      />
      <div style={{ position: "absolute", left: x - 26, top: 34, width: 52, height: 52, borderRadius: 26, background: ICE, border: `6px solid ${NAVY}`, boxShadow: "0 0 24px rgba(70,224,255,0.8)" }} />
      <div style={{ position: "absolute", left: x - 70, top: -58, width: 140, textAlign: "center", fontFamily: sans, fontWeight: 800, fontSize: 36, color: ICE, opacity: toBody }}>
        ≈ 7.4
      </div>
    </div>
  );
};

// Raised blue-green key for the closing call to action.
const SubscribeKey: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 13 } });
  const press = interpolate(frame, [30, 34, 40], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 935 }}>
      <div style={{ transform: `translateY(${(1 - p) * 60}px) scale(${0.8 + 0.2 * p})`, opacity: p }}>
        <div
          style={{
            padding: "24px 60px",
            borderRadius: 30,
            background: "linear-gradient(180deg, #7cf3c4 0%, #2ee59d 40%, #1fb3d6 100%)",
            boxShadow: `0 ${14 - press * 10}px 0 #0d6f6a, 0 ${30 - press * 18}px 50px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.7)`,
            transform: `translateY(${press * 10}px)`,
            fontFamily: sans,
            fontWeight: 800,
            fontSize: 50,
            letterSpacing: 1,
            color: NAVY,
          }}
        >
          OBUNA BO‘LING
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 860 }}>
      <div style={{ padding: 3, borderRadius: 999, background: GRAD, transform: `scale(${0.6 + 0.4 * p})`, opacity: p }}>
        <div style={{ padding: "14px 34px", borderRadius: 999, background: NAVY, color: ICE, fontFamily: sans, fontWeight: 650, fontSize: 40 }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

type Cue = [number, string, number];
const CUES: Cue[] = [
  [0.1, "whoosh-long.wav", 0.3],
  [1.6, "glass_002.ogg", 0.3],
  [3.85, "whoosh-short.wav", 0.35],
  [4.3, "maximize_004.ogg", 0.28],
  [7.85, "whoosh-short.wav", 0.25],
  [10.3, "pluck_002.ogg", 0.35],
  [12.6, "whoosh-short.wav", 0.35],
  [13.0, "maximize_006.ogg", 0.28],
  [18.1, "pluck_002.ogg", 0.35],
  [23.1, "whoosh-short.wav", 0.35],
  [24.0, "glass_001.ogg", 0.3],
  [28.45, "pluck_002.ogg", 0.35],
  [32.7, "whoosh-short.wav", 0.35],
  [33.1, "maximize_004.ogg", 0.28],
  [36.4, "glass_002.ogg", 0.3],
  [53.45, "confirmation_002.ogg", 0.3],
];

export const ChemEdit: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <OffthreadVideo src={staticFile("chem-footage.mp4")} style={{ width: "100%", height: "100%" }} />
      {/* Cool blue-green grade over the footage */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(63,169,255,0.22), rgba(46,229,157,0.18))", mixBlendMode: "soft-light" }} />

      <Sequence name="Opener · title behind speaker" durationInFrames={126}>
        <AbsoluteFill style={{ background: "rgba(63,169,255,0.22)", mixBlendMode: "color" }} />
        <TallTitleGrad />
        <Cutout dir="chem-cutout" count={126} />
        <Pill text="talaba nega qiynaladi?" at={sec(1.6)} />
      </Sequence>

      <Sequence name="Panel" from={sec(7.8)}>
        <PanelIn>
          <Panel>
            {SUBS.map((s) => (
              <Sequence key={s.from} name={s.text} from={sec(s.from) - sec(7.8)} durationInFrames={sec(s.to) - sec(s.from)}>
                <SubView s={s} />
              </Sequence>
            ))}
          </Panel>
        </PanelIn>
      </Sequence>

      <Sequence name="pH scale" from={sec(36.35)} durationInFrames={sec(43.0) - sec(36.35)}>
        <PhScale />
      </Sequence>

      <Sequence name="Subscribe" from={sec(53.45)}>
        <SubscribeKey />
      </Sequence>

      <Sequence name="Cut · NEGA" from={sec(4.0)} durationInFrames={sec(7.95) - sec(4.0)}>
        <CutAway
          len={sec(7.95) - sec(4.0)}
          variant="ring"
          y={0.15}
          title={
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
              <Rise delay={10}>
                <GradText grad={GRAD_V} style={{ fontFamily: tall, fontWeight: 300, fontSize: 300, lineHeight: 1 }}>
                  NEGA
                </GradText>
              </Rise>
            </AbsoluteFill>
          }
          lines={[
            { at: sec(5.0) - sec(4.0), text: "talaba", hl: "talaba" },
            { at: sec(7.1) - sec(4.0), text: "universitet programmasida" },
          ]}
        />
      </Sequence>

      <Sequence name="Cut · 01 uzviylik" from={sec(12.7)} durationInFrames={sec(18.15) - sec(12.7)}>
        <CutAway
          len={sec(18.15) - sec(12.7)}
          index="01"
          label="uzviylik"
          variant="broken"
          y={-0.3}
          lines={[
            { at: sec(13.8) - sec(12.7), text: "Maktabda berilgan" },
            { at: sec(14.5) - sec(12.7), text: "bilim va ko‘nikmalar" },
            { at: sec(15.4) - sec(12.7), text: "institutdagi talablarga" },
            { at: sec(16.8) - sec(12.7), text: "mos kelmasligi", hl: "mos kelmasligi" },
          ]}
        >
          <AbsoluteFill>
            <div style={{ position: "absolute", left: 40, top: 1265, width: 260, textAlign: "center", fontFamily: sans, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: BLUE }}>MAKTAB</div>
            <div style={{ position: "absolute", right: 40, top: 1265, width: 260, textAlign: "center", fontFamily: sans, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: GREEN }}>INSTITUT</div>
          </AbsoluteFill>
        </CutAway>
      </Sequence>

      <Sequence name="Cut · 02 test" from={sec(23.2)} durationInFrames={sec(28.5) - sec(23.2)}>
        <CutAway
          len={sec(28.5) - sec(23.2)}
          index="02"
          label="test"
          variant="answers"
          y={-0.7}
          lines={[
            { at: sec(24.0) - sec(23.2), text: "O‘qiganlarini nima uchun" },
            { at: sec(25.0) - sec(23.2), text: "noto‘g‘ri ekanligini" },
            { at: sec(26.9) - sec(23.2), text: "isbotlab berolmaydi", hl: "isbotlab berolmaydi" },
            { at: sec(27.4) - sec(23.2), text: "yoki umuman tushunmaydi" },
          ]}
        >
          <AbsoluteFill>
            {["A", "B", "C", "D"].map((l, i) => (
              <div key={l} style={{ position: "absolute", left: 540 + (i - 1.5) * 225 - 30, top: 1110, width: 60, textAlign: "center", fontFamily: sans, fontWeight: 800, fontSize: 40, color: ICE }}>
                {l}
              </div>
            ))}
          </AbsoluteFill>
        </CutAway>
      </Sequence>

      <Sequence name="Cut · 03 amalda" from={sec(32.8)} durationInFrames={sec(36.4) - sec(32.8)}>
        <CutAway
          len={sec(36.4) - sec(32.8)}
          index="03"
          label="amaliyot"
          variant="flask"
          y={-0.4}
          lines={[
            { at: sec(33.4) - sec(32.8), text: "O‘qigan bilim va ko‘nikmalarini" },
            { at: sec(35.0) - sec(32.8), text: "amalda qo‘llash yo‘q", hl: "yo‘q" },
          ]}
        />
      </Sequence>

      {CUES.map(([t, file, volume], i) => (
        <Sequence key={i} name={`sfx ${file}`} from={sec(t)} durationInFrames={60} layout="none">
          <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const PanelIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 6], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: p }}>{children}</AbsoluteFill>;
};

const TallTitleGrad: React.FC = () => (
  <AbsoluteFill style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.35))" }}>
    <TallTitle text="KIMYO" top={150} size={380} delay={4} fill={GRAD_V} />
  </AbsoluteFill>
);
