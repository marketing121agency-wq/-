import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { ArcText, GridCard, PopNumber, SubText, YELLOW, condensed, inter, useExit } from "./fx";

// Seconds where each word is spoken (measured from pauses in the voice track).
const sec = (s: number) => Math.round(s * 30);

const yellowHead: React.CSSProperties = {
  fontFamily: condensed,
  fontSize: 150,
  lineHeight: 1.02,
  color: YELLOW,
  transform: "skewX(-6deg)",
};

const cardHead = (fontSize: number): React.CSSProperties => ({
  fontFamily: inter,
  fontWeight: 800,
  fontStyle: "italic",
  fontSize,
  lineHeight: 1,
  letterSpacing: -5,
  color: "white",
  justifyContent: "center",
});

// One caption group laid over the footage, fading out at its end.
const Overlay: React.FC<{ from: number; to: number; top: number; name: string; children: React.ReactNode }> = ({
  from,
  to,
  top,
  name,
  children,
}) => (
  <Sequence name={name} from={sec(from)} durationInFrames={sec(to) - sec(from)}>
    <Fade duration={sec(to) - sec(from)} top={top}>
      {children}
    </Fade>
  </Sequence>
);

const Fade: React.FC<{ duration: number; top: number; children: React.ReactNode }> = ({ duration, top, children }) => (
  <AbsoluteFill style={{ opacity: useExit(duration, 6), paddingTop: top, paddingLeft: 90, paddingRight: 90 }}>
    {children}
  </AbsoluteFill>
);

// Offsets inside a group, in frames from the group's start.
const at = (word: number, groupStart: number) => sec(word) - sec(groupStart);

export const AuditEdit: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo src={staticFile("audit-footage.mp4")} />

      <Overlay name="Marketing jamoalar" from={0.4} to={3.2} top={1020}>
        <SubText text="tashqaridan ko‘plab" delay={0} size={54} />
        <ArcText text="MARKETING" delay={at(1.3, 0.4)} glowColor={YELLOW} style={yellowHead} />
        <ArcText text="JAMOALARNI" delay={at(1.8, 0.4)} glowColor={YELLOW} style={yellowHead} />
        <SubText text="olib keldingiz" delay={at(2.5, 0.4)} size={54} />
      </Overlay>

      {/* Cut away to the orange grid card while the voice continues. */}
      <Sequence name="Zamonaviy card" from={sec(3.2)} durationInFrames={sec(6.1) - sec(3.2)}>
        <GridCard />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 60 }}>
          <Fade duration={sec(6.1) - sec(3.2)} top={0}>
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
              <SubText text="va ularning" delay={0} size={56} align="center" />
              <ArcText text="ZAMONAVIY" delay={at(3.75, 3.2)} glowColor="#fff4d6" style={cardHead(150)} radius={600} />
              <ArcText text="TERMINLARINI" delay={at(4.45, 3.2)} glowColor="#fff4d6" style={cardHead(116)} radius={600} />
              <div style={{ marginTop: 16 }}>
                <SubText text="tushunmayotgan bo‘lsangiz" delay={at(5.3, 3.2)} size={54} align="center" />
              </div>
            </AbsoluteFill>
          </Fade>
        </AbsoluteFill>
      </Sequence>

      <Overlay name="Biznesmen tilida" from={6.4} to={8.2} top={1020}>
        <SubText text="men sizga" delay={0} size={54} />
        <ArcText text="BIZNESMEN" delay={at(6.9, 6.4)} glowColor={YELLOW} style={yellowHead} />
        <ArcText text="TILIDA" delay={at(7.3, 6.4)} glowColor={YELLOW} style={yellowHead} />
        <SubText text="qilingan" delay={at(7.82, 6.4)} size={54} />
      </Overlay>

      <Overlay name="Bepul audit" from={8.2} to={durationInFrames / 30} top={1040}>
        <SubText text="audit xizmatini" delay={0} size={58} />
        <PopNumber text="BEPULGA" delay={at(9.24, 8.2)} size={270} />
        <SubText text="beraman" delay={at(9.65, 8.2)} size={58} />
      </Overlay>
    </AbsoluteFill>
  );
};
