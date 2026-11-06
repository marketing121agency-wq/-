import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Card3D } from "./Card3D";
import { CaptionPanel, Cutout, Dust, GridVignette, PanelLine, Pill, TallTitle } from "./Pieces";
import { PAPER, sans, sec, tall } from "./tokens";

// Black studio with a soft overhead spotlight, for the 3D cut-aways.
const Studio: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 50% 38%, #2a2a2a 0%, #0d0d0d 55%, #050505 100%)" }}>
    {children}
  </AbsoluteFill>
);

const FadeIn: React.FC<{ children: React.ReactNode; len?: number }> = ({ children, len = 8 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(frame, [0, len], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};

// Style preview: opener with the title behind the speaker, then a 3D cut-away.
export const PremiumPreview: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <OffthreadVideo src={staticFile("hr-footage.mp4")} style={{ filter: "saturate(0.55) contrast(1.08) brightness(0.92)" }} />
    <Sequence name="Behind title" durationInFrames={126}>
      <TallTitle text="XODIM" top={150} size={360} delay={4} />
      <Cutout dir="hr-cutout" count={126} />
    </Sequence>
    <GridVignette opacity={0.08} />
    <Sequence name="Pill" durationInFrames={126}>
      <Pill text="ishdan haydalishi aniq" at={sec(1.4)} out={sec(3.4)} y={905} />
    </Sequence>

    {/* Permanent panel over the source clip's burned-in caption. */}
    <CaptionPanel>
      <Sequence name="Hook" durationInFrames={sec(4.2)} layout="none">
        <PanelLine text="Ushbu narsa bo‘lmasa" delay={2} />
        <PanelLine text="xodim ishdan haydaladi" hl="haydaladi" delay={10} />
      </Sequence>
    </CaptionPanel>

    <Sequence name="3D card" from={sec(4.2)} durationInFrames={sec(3)}>
      <FadeIn>
        <Studio>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
            <div style={{ fontFamily: tall, fontWeight: 200, fontSize: 260, lineHeight: 1, color: PAPER, opacity: 0.9 }}>01</div>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 44, color: "rgba(244,243,239,0.7)", marginTop: 6 }}>xodim kartasi</div>
          </AbsoluteFill>
          <Card3D title="XODIM" subtitle="Bo‘lim: Savdo" />
          <Dust />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 380 }}>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 60, color: PAPER, letterSpacing: -1 }}>
              ishdan <span style={{ fontStyle: "italic", fontWeight: 300 }}>haydalishi aniq</span>
            </div>
          </AbsoluteFill>
        </Studio>
      </FadeIn>
    </Sequence>
  </AbsoluteFill>
);
