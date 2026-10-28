import { Composition, Series } from "remotion";
import { AuditEdit } from "./motion/AuditEdit";
import { GrowthEdit } from "./motion/GrowthEdit";
import { TiredEdit } from "./motion/TiredEdit";
import { GlassSubsEdit, cityLines, mallLines } from "./motion/GlassSubs";
import { CardScene, HeadlineScene, IconScene, NumberScene } from "./motion/Scenes";

export const MyComposition = () => {
  return (
    <Composition
      id="AgencyPromo"
      component={AgencyPromo}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

export const AuditEditComposition = () => {
  return (
    <Composition
      id="AuditEdit"
      component={AuditEdit}
      durationInFrames={318}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

export const GrowthEditComposition = () => {
  return (
    <Composition
      id="GrowthEdit"
      component={GrowthEdit}
      durationInFrames={308}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

export const TiredEditComposition = () => {
  return (
    <Composition
      id="TiredEdit"
      component={TiredEdit}
      durationInFrames={203}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

export const GlassSubsCompositions = () => {
  return (
    <>
      <Composition
        id="CitySubs"
        component={GlassSubsEdit}
        defaultProps={{ src: "city-footage.mp4", lines: cityLines }}
        durationInFrames={530}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="MallSubs"
        component={GlassSubsEdit}
        defaultProps={{ src: "mall-footage.mp4", lines: mallLines }}
        durationInFrames={937}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

export const AgencyPromo: React.FC = () => {
  return (
    <Series>
      <Series.Sequence name="Hook" durationInFrames={90}>
        <HeadlineScene duration={90} caption="biznesingizga kerak" headline="YANGI MIJOZLAR" />
      </Series.Sequence>
      <Series.Sequence name="Services" durationInFrames={90}>
        <CardScene duration={90} line1="SMM VA" line2="TARGET" caption="bitta jamoada" />
      </Series.Sequence>
      <Series.Sequence name="Result" durationInFrames={105}>
        <NumberScene duration={105} above="har oy" value="1 000+" below="yangi so‘rovlar" />
      </Series.Sequence>
      <Series.Sequence name="CTA" durationInFrames={90}>
        <IconScene duration={90} left="Direct’ga" right="yozing" />
      </Series.Sequence>
      <Series.Sequence name="Offer" durationInFrames={75}>
        <CardScene duration={75} line1="BEPUL" line2="AUDIT" caption="birinchi qadam bizdan" />
      </Series.Sequence>
    </Series>
  );
};
