import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ArcText, GridCard, PopNumber, SubText, YELLOW } from "./fx";
import { Fade, Overlay, at, cardHead, sec, yellowHead } from "./AuditEdit";
import { GlowIcon, Row, dash } from "./GrowthEdit";
import { Flash, LightLeak, PunchCamera, SparkleBurst, Underline, ZoomIn } from "./extras";

const RED = "#ff3b30";

// Circular arrows that keep spinning, for "aralashib yurgan" (juggling everything).
const SpinArrows: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ transform: `rotate(${Math.max(0, frame - delay) * 9}deg)` }}>
      <GlowIcon delay={delay} size={130} color={YELLOW}>
        {(d) => (
          <>
            <path d="M84 50 A34 34 0 0 1 26 74" {...dash(d)} />
            <path d="M16 50 A34 34 0 0 1 74 26" {...dash(d)} />
            <path d="M64 16 L76 26 L62 34 M36 84 L24 74 L38 66" {...dash(d)} />
          </>
        )}
      </GlowIcon>
    </div>
  );
};

// Battery that drains from full green to blinking red.
const Battery: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const t = frame - delay;
  const level = interpolate(t, [0, 26], [1, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const color = level > 0.6 ? "#3dff3a" : level > 0.3 ? YELLOW : RED;
  const blink = level < 0.1 ? (Math.floor(t / 4) % 2 === 0 ? 1 : 0.25) : 1;
  const appear = interpolate(t, [-6, 0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", opacity: appear * blink }}>
      <div
        style={{
          width: 260,
          height: 120,
          borderRadius: 22,
          border: "9px solid white",
          padding: 10,
          boxShadow: `0 0 14px white, 0 0 34px ${color}`,
        }}
      >
        <div
          style={{
            width: `${level * 100}%`,
            height: "100%",
            borderRadius: 10,
            background: color,
            boxShadow: `0 0 18px ${color}, 0 0 40px ${color}`,
          }}
        />
      </div>
      <div style={{ width: 20, height: 50, marginLeft: 6, borderRadius: 6, background: "white", boxShadow: "0 0 12px white" }} />
    </div>
  );
};

// Red vignette that pulses in for the punchline.
const RedPulse: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  if (t < 0) return null;
  const o = interpolate(t, [0, 6], [0, 1], { extrapolateRight: "clamp" }) * (0.55 + 0.25 * Math.sin(t / 3));
  return (
    <AbsoluteFill
      style={{ background: "radial-gradient(circle at 50% 45%, transparent 45%, rgba(200,0,0,0.75) 100%)", opacity: o }}
    />
  );
};

export const TiredEdit: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <PunchCamera
        keys={[
          [0, 1],
          [sec(0.57), 1.07],
          [sec(3.15), 1.0],
          [sec(3.42), 1.1],
          [sec(4.51), 1.03],
          [sec(5.05), 1.1],
          [sec(5.72), 1.2],
        ]}
        shakes={[sec(3.42), sec(3.9), sec(5.72), sec(6.1)]}
      >
        <OffthreadVideo src={staticFile("tired-footage.mp4")} />
      </PunchCamera>
      <RedPulse from={sec(5.72)} />
      <LightLeak at={sec(1.3)} />
      <LightLeak at={sec(3.0)} />

      <Overlay name="Biznes egasi" from={0.25} to={1.52} top={1020}>
        <Row>
          <ArcText text="BIZNES EGASI" delay={at(0.3, 0.25)} stagger={0.9} glowColor={YELLOW} style={yellowHead} />
          <GlowIcon delay={at(0.95, 0.25)} size={110} color={YELLOW}>
            {(d) => <path d="M10 80 L16 30 L36 52 L50 18 L64 52 L84 30 L90 80 Z" {...dash(d)} />}
          </GlowIcon>
        </Row>
        <Underline at={at(0.9, 0.25)} width={720} color={YELLOW} />
        <SubText text="bo‘lib turib" delay={at(0.98, 0.25)} size={58} />
      </Overlay>
      <SparkleBurst at={sec(1.0)} x={900} y={1090} color={YELLOW} />

      {/* Card cutaway: sales and ads icons pop as each is named. */}
      <Sequence name="Sotuv va reklama card" from={sec(1.52)} durationInFrames={sec(3.15) - sec(1.52)}>
        <ZoomIn>
          <GridCard />
          <Fade duration={sec(3.15) - sec(1.52)} top={0}>
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 40 }}>
              <div style={{ display: "flex", gap: 90, marginBottom: 40 }}>
                <GlowIcon delay={at(1.66, 1.52)} size={190} color="#ffffff">
                  {(d) => (
                    <>
                      <path d="M4 14 H20 L30 64 H82 L92 30 H24" {...dash(d)} />
                      <circle cx={38} cy={82} r={7} {...dash(d)} />
                      <circle cx={74} cy={82} r={7} {...dash(d)} />
                    </>
                  )}
                </GlowIcon>
                <GlowIcon delay={at(2.2, 1.52)} size={190} color="#ffffff">
                  {(d) => (
                    <>
                      <path d="M12 40 V62 H30 L70 84 V18 L30 40 Z" {...dash(d)} />
                      <path d="M80 36 Q92 51 80 66" {...dash(d)} />
                      <path d="M30 62 L36 84" {...dash(d)} />
                    </>
                  )}
                </GlowIcon>
              </div>
              <SubText text="ham sotuvga, ham" delay={at(1.6, 1.52)} size={58} align="center" />
              <ArcText text="REKLAMA" delay={at(2.2, 1.52)} stagger={1} glowColor="#fff4d6" style={cardHead(170)} radius={600} />
              <ArcText text="MARKETINGGA" delay={at(2.61, 1.52)} stagger={0.8} glowColor="#fff4d6" style={cardHead(118)} radius={600} />
            </AbsoluteFill>
          </Fade>
          <SparkleBurst at={at(1.75, 1.52)} x={360} y={700} color="#fff4d6" count={8} />
          <SparkleBurst at={at(2.3, 1.52)} x={720} y={700} color="#fff4d6" count={8} />
        </ZoomIn>
        <Flash at={0} />
      </Sequence>
      <Flash at={sec(3.15)} />

      <Overlay name="Aralashib yurgan" from={3.15} to={4.51} top={1020}>
        <SubText text="o‘zingiz" delay={0} size={58} />
        <Row>
          <ArcText text="ARALASHIB" delay={at(3.42, 3.15)} stagger={1} glowColor={YELLOW} style={yellowHead} />
          <SpinArrows delay={at(3.6, 3.15)} />
        </Row>
        <SubText text="yurgan bo‘lsangiz" delay={at(3.97, 3.15)} size={58} />
      </Overlay>

      <Overlay name="Siz emas" from={4.51} to={5.72} top={1060}>
        <SubText text="tez orada" delay={0} size={60} />
        <ArcText text="SIZ EMAS" delay={at(4.98, 4.51)} stagger={0.8} glowColor="#ffffff" style={{ ...cardHead(150), justifyContent: "flex-start" }} radius={500} />
      </Overlay>

      <Flash at={sec(5.72)} color={RED} peak={0.45} />
      <Sequence name="Biznes charchaydi" from={sec(5.72)} durationInFrames={durationInFrames - sec(5.72)}>
        <AbsoluteFill style={{ paddingTop: 980, paddingLeft: 90 }}>
          <PopNumber text="BIZNES" delay={0} size={230} color={RED} stagger={1.5} />
          <PopNumber text="CHARCHAYDI" delay={at(6.05, 5.72)} size={170} color={RED} stagger={1} />
          <div style={{ marginTop: 40 }}>
            <Battery delay={at(5.9, 5.72)} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <SparkleBurst at={sec(6.2)} x={500} y={1300} color={RED} count={10} spread={320} />
    </AbsoluteFill>
  );
};
