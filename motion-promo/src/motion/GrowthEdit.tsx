import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ArcText, GREEN, GridCard, PopNumber, SubText, YELLOW } from "./fx";
import { Fade, Overlay, at, cardHead, sec, yellowHead } from "./AuditEdit";
import { Flash, GrowBars, LightLeak, PunchCamera, RisingArrows, SparkleBurst, Underline, ZoomIn } from "./extras";

// Outline icon that draws itself on and pops in with a glow, like the chain-link shot.
const GlowIcon: React.FC<{ delay: number; size: number; color?: string; children: (draw: number) => React.ReactNode }> = ({
  delay,
  size,
  color = "white",
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(frame - delay, [0, 18], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pop = spring({ frame: frame - delay, fps, config: { damping: 11 } });
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{
        overflow: "visible",
        transform: `scale(${pop}) rotate(${(1 - pop) * -25}deg)`,
        filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 22px ${color})`,
      }}
    >
      <g fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round">
        {children(draw)}
      </g>
    </svg>
  );
};

const dash = (draw: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: draw });

const Check: React.FC<{ delay: number }> = ({ delay }) => (
  <GlowIcon delay={delay} size={96} color={YELLOW}>
    {(d) => <path d="M18 54 L42 76 L84 26" {...dash(d)} />}
  </GlowIcon>
);

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 28 }}>{children}</div>
);

export const GrowthEdit: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Punch-ins land on the key words; shakes hit on the big reveals. */}
      <PunchCamera
        keys={[
          [0, 1],
          [sec(0.8), 1.06],
          [sec(2.05), 1.12],
          [sec(5.5), 1.0],
          [sec(7.0), 1.1],
          [sec(7.94), 1.18],
          [sec(9.39), 1.04],
        ]}
        shakes={[sec(7.0), sec(7.94)]}
      >
        <OffthreadVideo src={staticFile("growth-footage.mp4")} />
      </PunchCamera>
      <LightLeak at={sec(2.55)} />
      <LightLeak at={sec(5.25)} />

      <Overlay name="Eng sifatli, eng arzon" from={0} to={2.8} top={1000}>
        <SubText text="mahsulotingiz" delay={2} size={56} />
        <Row>
          <ArcText text="ENG SIFATLI" delay={at(0.8, 0)} glowColor={YELLOW} style={yellowHead} />
          <Check delay={at(1.55, 0)} />
        </Row>
        <Underline at={at(1.55, 0)} width={560} color={YELLOW} />
        <SubText text="va" delay={at(1.9, 0)} size={56} />
        <Row>
          <ArcText text="ENG ARZON" delay={at(1.95, 0)} stagger={0.8} glowColor={YELLOW} style={yellowHead} />
          <Check delay={at(2.35, 0)} />
        </Row>
        <Underline at={at(2.35, 0)} width={500} color={YELLOW} />
      </Overlay>
      <SparkleBurst at={sec(1.55)} x={730} y={1180} color={YELLOW} />
      <SparkleBurst at={sec(2.35)} x={680} y={1420} color={YELLOW} />

      {/* Card cutaway with a rising arrow while the voice continues. */}
      <Sequence name="Konkurent card" from={sec(2.8)} durationInFrames={sec(5.3) - sec(2.8)}>
        <ZoomIn>
        <GridCard />
        <Fade duration={sec(5.3) - sec(2.8)} top={0}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 40 }}>
            <div style={{ position: "relative", marginBottom: 40, width: 320, height: 280, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <GrowBars at={at(3.9, 2.8)} heights={[90, 160, 240]} />
              <div style={{ position: "absolute", left: 10, top: -10 }}>
                <GlowIcon delay={at(4.2, 2.8)} size={300} color="#ffffff">
                  {(d) => (
                    <>
                      <path d="M6 88 L34 58 L52 72 L92 22" {...dash(d)} />
                      <path d="M70 20 L94 20 L94 44" {...dash(d)} />
                    </>
                  )}
                </GlowIcon>
              </div>
            </div>
            <SubText text="lekin" delay={2} size={58} align="center" />
            <ArcText text="KONKURENT" delay={at(3.2, 2.8)} glowColor="#fff4d6" style={cardHead(160)} radius={600} />
            <div style={{ marginTop: 14 }}>
              <SubText text="sizdan ko‘proq sotyapti" delay={at(3.8, 2.8)} size={58} align="center" />
            </div>
          </AbsoluteFill>
        </Fade>
        <SparkleBurst at={at(4.5, 2.8)} x={640} y={640} color="#fff4d6" count={11} />
        </ZoomIn>
        <Flash at={0} />
      </Sequence>
      <Flash at={sec(5.3)} />

      <Overlay name="Bu holatda" from={5.5} to={6.36} top={1300}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <GlowIcon delay={0} size={150} color={YELLOW}>
            {(d) => (
              <>
                <path d="M50 8 L94 88 H6 Z" {...dash(d)} />
                <path d="M50 38 V60 M50 74 V75" {...dash(d)} />
              </>
            )}
          </GlowIcon>
        </div>
        <SubText text="bu holatda" delay={0} size={64} align="center" />
      </Overlay>

      <Overlay name="Chuqur audit" from={6.36} to={7.94} top={1000}>
        <SubText text="men sizga biznesni" delay={0} size={56} />
        <ArcText text="CHUQUR AUDIT" delay={at(6.9, 6.36)} stagger={0.8} glowColor={YELLOW} style={yellowHead} />
        <Underline at={at(7.45, 6.36)} width={760} color={YELLOW} />
        <SubText text="qilish" delay={at(7.6, 6.36)} size={56} />
      </Overlay>
      <Sequence name="Lupa" from={sec(7.0)} durationInFrames={sec(7.94) - sec(7.0)}>
        <Fade duration={sec(7.94) - sec(7.0)} top={0}>
          <div style={{ position: "absolute", right: 90, top: 1470 }}>
            <GlowIcon delay={6} size={190} color="#ffffff">
              {(d) => (
                <>
                  <circle cx={42} cy={42} r={30} {...dash(d)} />
                  <path d="M64 64 L92 92" {...dash(d)} />
                </>
              )}
            </GlowIcon>
          </div>
        </Fade>
      </Sequence>
      <SparkleBurst at={sec(7.45)} x={560} y={1180} color={YELLOW} count={10} />

      <Sequence name="O'sish strelkalar" from={sec(7.94)} durationInFrames={sec(9.39) - sec(7.94)}>
        <Fade duration={sec(9.39) - sec(7.94)} top={0}>
          <RisingArrows at={0} color={GREEN} />
        </Fade>
      </Sequence>
      <Flash at={sec(7.94)} color={GREEN} peak={0.4} />
      <SparkleBurst at={sec(8.2)} x={420} y={1130} color={GREEN} count={12} spread={340} />
      <Overlay name="O'sish nuqtalari" from={7.94} to={9.39} top={1000}>
        <PopNumber text="O‘SISH" delay={0} size={270} />
        <SubText text="nuqtalaringizni aniqlashni" delay={at(8.25, 7.94)} size={56} />
      </Overlay>

      <Sequence name="Maslahat beraman" from={sec(9.39)} durationInFrames={durationInFrames - sec(9.39)}>
        <AbsoluteFill style={{ opacity: 1 }}>
          <div style={{ position: "absolute", left: 90, top: 1030 }}>
            <SubText text="maslahat" delay={0} size={62} />
          </div>
          <div style={{ position: "absolute", left: 415, top: 1110 }}>
            <GlowIcon delay={2} size={250} color={GREEN}>
              {(d) => (
                <>
                  <circle cx={50} cy={50} r={40} {...dash(d)} />
                  <circle cx={50} cy={50} r={22} {...dash(d)} />
                  <path d="M50 0 V20 M50 80 V100 M0 50 H20 M80 50 H100" {...dash(d)} />
                </>
              )}
            </GlowIcon>
          </div>
          <div style={{ position: "absolute", right: 90, top: 1390 }}>
            <SubText text="beraman" delay={at(9.79, 9.39)} size={62} align="right" />
          </div>
        </AbsoluteFill>
      </Sequence>
      <SparkleBurst at={sec(9.75)} x={540} y={1235} color={GREEN} count={10} />
    </AbsoluteFill>
  );
};
