import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ArcText, Bokeh, GridCard, PopNumber, SubText, YELLOW, condensed, inter, useExit } from "./fx";

const NIGHT = ["#ff9a1f", "#ffb347", "#ffd27a", "#2a6b6b"];
const TEAL_NIGHT = ["#1f8a8a", "#ff9a1f", "#4fd1c5", "#ffc066"];

const Block: React.FC<{ duration: number; top: number; children: React.ReactNode }> = ({ duration, top, children }) => (
  <AbsoluteFill style={{ opacity: useExit(duration), paddingTop: top, paddingLeft: 90, paddingRight: 90 }}>
    {children}
  </AbsoluteFill>
);

// Yellow condensed headline under a thin caption (the "ismim MUHAMMADJON" shot).
export const HeadlineScene: React.FC<{ duration: number; caption: string; headline: string }> = ({
  duration,
  caption,
  headline,
}) => (
  <AbsoluteFill>
    <Bokeh seed="a" hues={NIGHT} />
    <Block duration={duration} top={1050}>
      <SubText text={caption} delay={4} />
      <ArcText
        text={headline}
        delay={10}
        glowColor={YELLOW}
        style={{ fontFamily: condensed, fontSize: 150, lineHeight: 1.05, color: YELLOW, transform: "skewX(-6deg)" }}
      />
    </Block>
  </AbsoluteFill>
);

// Orange grid card with two stacked white glowing lines.
export const CardScene: React.FC<{ duration: number; line1: string; line2: string; caption: string }> = ({
  duration,
  line1,
  line2,
  caption,
}) => {
  const head: React.CSSProperties = {
    fontFamily: inter,
    fontWeight: 800,
    fontStyle: "italic",
    fontSize: 190,
    lineHeight: 1,
    letterSpacing: -6,
    color: "white",
    justifyContent: "center",
  };
  return (
    <AbsoluteFill>
      <GridCard />
      <AbsoluteFill style={{ opacity: useExit(duration), justifyContent: "center", alignItems: "center" }}>
        <ArcText text={line1} delay={4} glowColor="#fff4d6" style={head} radius={600} />
        <ArcText text={line2} delay={14} glowColor="#fff4d6" style={head} radius={600} />
        <div style={{ marginTop: 18 }}>
          <SubText text={caption} delay={10} size={52} align="center" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Green counter sandwiched between two captions.
export const NumberScene: React.FC<{ duration: number; above: string; value: string; below: string }> = ({
  duration,
  above,
  value,
  below,
}) => (
  <AbsoluteFill>
    <Bokeh seed="b" hues={TEAL_NIGHT} />
    <Block duration={duration} top={1000}>
      <SubText text={above} delay={2} size={54} />
      <PopNumber text={value} delay={10} />
      <SubText text={below} delay={22} size={54} />
    </Block>
  </AbsoluteFill>
);

// Glowing outline icon drawn on between two offset words (the chain-link shot).
export const IconScene: React.FC<{ duration: number; left: string; right: string }> = ({ duration, left, right }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(frame, [6, 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pop = spring({ frame: frame - 4, fps, config: { damping: 11 } });
  return (
    <AbsoluteFill>
      <Bokeh seed="c" hues={NIGHT} />
      <AbsoluteFill style={{ opacity: useExit(duration) }}>
        <div style={{ position: "absolute", left: 90, top: 1020 }}>
          <SubText text={left} delay={0} size={58} />
        </div>
        <svg
          viewBox="0 0 100 100"
          width={250}
          height={250}
          style={{
            position: "absolute",
            left: 415,
            top: 1080,
            transform: `scale(${pop}) rotate(${(1 - pop) * -30}deg)`,
            filter: "drop-shadow(0 0 8px #fff) drop-shadow(0 0 24px rgba(255,255,255,0.8))",
          }}
        >
          <path
            d="M20 22 h60 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 h-32 l-18 14 v-14 h-10 a10 10 0 0 1 -10 -10 v-30 a10 10 0 0 1 10 -10 z"
            fill="none"
            stroke="white"
            strokeWidth={7}
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={draw}
          />
          {[35, 50, 65].map((cx, i) => (
            <circle key={cx} cx={cx} cy={47} r={4.5} fill="white" opacity={interpolate(frame, [26 + i * 4, 32 + i * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          ))}
        </svg>
        <div style={{ position: "absolute", right: 90, top: 1330 }}>
          <SubText text={right} delay={18} size={58} align="right" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

