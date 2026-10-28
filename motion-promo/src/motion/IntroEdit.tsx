import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ArcText, GridCard, PopNumber, SubText, YELLOW } from "./fx";
import { Fade, Overlay, at, cardHead, sec, yellowHead } from "./AuditEdit";
import { GlowIcon, dash } from "./GrowthEdit";

const PART1 = 192; // 6.4 s at 30 fps

// Each camera setup gets its own fixed crop with a slow push-in, as in the reference cut.
const Shot: React.FC<{ src: string; trimBefore: number; length: number; scale: number; originY: string }> = ({
  src,
  trimBefore,
  length,
  scale,
  originY,
}) => {
  const frame = useCurrentFrame();
  const s = scale + interpolate(frame, [0, length], [0, 0.04]);
  return (
    <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `50% ${originY}` }}>
      <OffthreadVideo src={staticFile(src)} trimBefore={trimBefore} />
    </AbsoluteFill>
  );
};

const Centered: React.FC<{ lines: string[]; delays: number[]; size?: number }> = ({ lines, delays, size = 54 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    {lines.map((l, i) => (
      <SubText key={l} text={l} delay={delays[i]} size={size} align="center" backdrop />
    ))}
  </div>
);

// Sound effects, all quieter than the voice: whooshes on arc-in headlines and the card cut,
// a soft glass ping when white captions appear, plucks on each popped digit or letter.
type Cue = [number, string, number];
const caption = (t: number): Cue => [t, "glass_001.ogg", 0.16];
const plucks = (start: number, text: string): Cue[] =>
  [...text].flatMap((c, i) => (c === " " ? [] : [[start + i * 0.1, "pluck_002.ogg", 0.3] as Cue]));

const CUES: Cue[] = [
  [0.27, "whoosh-short.wav", 0.35],
  caption(1.15),
  caption(1.95),
  [2.05, "whoosh-short.wav", 0.35],
  [3.75, "whoosh-long.wav", 0.4],
  [4.0, "impactSoft_medium_000.ogg", 0.45],
  [4.1, "whoosh-short.wav", 0.28],
  [4.4, "whoosh-short.wav", 0.28],
  [6.45, "whoosh-long.wav", 0.32],
  caption(7.1),
  caption(8.9),
  ...plucks(9.03, "500 000$"),
  [9.85, "confirmation_002.ogg", 0.3],
  caption(12.2),
  caption(14.0),
  caption(15.7),
  caption(18.1),
  [18.67, "maximize_004.ogg", 0.32],
  [19.2, "glass_002.ogg", 0.3],
  caption(19.5),
  caption(20.25),
  [20.75, "whoosh-short.wav", 0.35],
  ...plucks(21.85, "O‘SISH"),
  [22.5, "maximize_006.ogg", 0.3],
];

const Sfx: React.FC = () => (
  <>
    {CUES.map(([t, file, volume], i) => (
      <Sequence key={i} name={`sfx ${file}`} from={Math.round(t * 30)} durationInFrames={60} layout="none">
        <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
      </Sequence>
    ))}
  </>
);

export const IntroEdit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Sequence name="Part 1" durationInFrames={PART1}>
      <Shot src="intro-part1.mp4" trimBefore={0} length={PART1} scale={1.3} originY="30%" />
    </Sequence>
    <Sequence name="Part 2 · bush" from={PART1} durationInFrames={180}>
      <Shot src="intro-part2.mp4" trimBefore={0} length={180} scale={1.25} originY="35%" />
    </Sequence>
    <Sequence name="Part 2 · dome" from={PART1 + 180} durationInFrames={180}>
      <Shot src="intro-part2.mp4" trimBefore={180} length={180} scale={1.0} originY="40%" />
    </Sequence>
    <Sequence name="Part 2 · tower" from={PART1 + 360} durationInFrames={171}>
      <Shot src="intro-part2.mp4" trimBefore={360} length={171} scale={1.2} originY="35%" />
    </Sequence>

    <Sfx />

    <Overlay name="Ismim Muhammadjon" from={0.2} to={1.15} top={1220}>
      <SubText text="ismim" delay={0} size={56} backdrop />
      <ArcText text="MUHAMMADJON" delay={3} stagger={0.6} glowColor={YELLOW} style={yellowHead} />
    </Overlay>

    <Overlay name="Jamoamiz bilan" from={1.15} to={1.95} top={1320}>
      <Centered lines={["jamoamiz bilan birga"]} delays={[0]} size={58} />
    </Overlay>

    <Overlay name="Katta va o'rta" from={1.95} to={4.0} top={1200}>
      <SubText text="4 yildan beri" delay={0} size={56} backdrop />
      <ArcText text="KATTA VA O‘RTA" delay={at(2.05, 1.95)} stagger={1} glowColor={YELLOW} style={yellowHead} />
      <SubText text="bizneslarga" delay={at(2.6, 1.95)} size={56} align="right" backdrop />
    </Overlay>

    <Sequence name="Digital marketing card" from={sec(4.0)} durationInFrames={sec(6.6) - sec(4.0)}>
      <GridCard />
      <Fade duration={sec(6.6) - sec(4.0)} top={0}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <ArcText text="DIGITAL" delay={3} glowColor="#fff4d6" style={cardHead(150)} radius={600} />
          <ArcText text="MARKETING" delay={12} glowColor="#fff4d6" style={cardHead(150)} radius={600} />
          <div style={{ marginTop: 14 }}>
            <SubText text="xizmatini ko‘rsatib kelamiz" delay={10} size={54} align="center" />
          </div>
        </AbsoluteFill>
      </Fade>
    </Sequence>

    <Overlay name="Daromad 2x" from={7.1} to={8.75} top={1280}>
      <Centered lines={["loyihalarimiz daromadini 2x ga oshirish"]} delays={[0]} size={50} />
    </Overlay>

    <Overlay name="500 000$" from={8.9} to={11.65} top={1180}>
      <SubText text="ijtimoiy tarmoqlarda" delay={0} size={56} backdrop />
      <PopNumber text="500 000$" delay={4} size={250} />
      <SubText text="dan oshiq sotuvlar qilganmiz" delay={14} size={56} backdrop />
    </Overlay>

    <Overlay name="Chuqur audit" from={12.2} to={13.75} top={1260}>
      <Centered lines={["jamoamiz biznesni chuqur", "audit qilish"]} delays={[0, 14]} size={56} />
    </Overlay>

    <Overlay name="Bozorni o'lchash" from={14.0} to={15.25} top={1300}>
      <Centered lines={["bozorni raqamlarda o‘lchash"]} delays={[0]} size={58} />
    </Overlay>

    <Overlay name="Strategiya" from={15.7} to={17.95} top={1240}>
      <Centered lines={["va ko‘p yillik marketing", "strategiya tuzish", "ko‘nikmalariga ega"]} delays={[0, 18, 36]} size={54} />
    </Overlay>

    {/* Link icon between offset words, as in the reference's "ro'yxatdan o'tsangiz" shot. */}
    <Sequence name="Havola" from={sec(18.1)} durationInFrames={sec(20.25) - sec(18.1)}>
      <Fade duration={sec(20.25) - sec(18.1)} top={0}>
        <div style={{ position: "absolute", left: 90, top: 1200 }}>
          <SubText text="agar ushbu havolani bosib" delay={0} size={56} backdrop />
        </div>
        <div style={{ position: "absolute", left: 230, top: 1310 }}>
          <GlowIcon delay={at(18.67, 18.1)} size={240} color="#ffffff">
            {(d) => (
              <>
                <path d="M44 58 L58 44" {...dash(d)} />
                <path d="M40 40 L52 28 A16 16 0 0 1 74 50 L62 62" {...dash(d)} />
                <path d="M60 60 L48 72 A16 16 0 0 1 26 50 L38 38" {...dash(d)} />
              </>
            )}
          </GlowIcon>
        </div>
        <div style={{ position: "absolute", right: 90, top: 1580 }}>
          <SubText text="ro‘yxatdan o‘tsangiz" delay={at(19.5, 18.1)} size={56} align="right" backdrop />
        </div>
      </Fade>
    </Sequence>

    <Overlay name="Tekinga audit" from={20.25} to={21.85} top={1200}>
      <SubText text="biznesingizni" delay={0} size={56} backdrop />
      <ArcText text="TEKINGA AUDIT" delay={at(20.75, 20.25)} stagger={0.9} glowColor={YELLOW} style={yellowHead} />
      <SubText text="qilib" delay={at(21.5, 20.25)} size={56} backdrop />
    </Overlay>

    <Overlay name="O'sish nuqtalari" from={21.85} to={24.1} top={1180}>
      <PopNumber text="O‘SISH" delay={0} size={250} />
      <SubText text="nuqtalaringizni" delay={at(22.1, 21.85)} size={56} backdrop />
      <SubText text="belgilab beramiz" delay={at(22.85, 21.85)} size={56} backdrop />
    </Overlay>
  </AbsoluteFill>
);

