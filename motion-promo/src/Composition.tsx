import { Composition, Series } from "remotion";
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
