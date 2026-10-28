import { AuditEditComposition, GrowthEditComposition, TiredEditComposition, GlassSubsCompositions, IntroEditComposition, MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <AuditEditComposition />
      <GrowthEditComposition />
      <TiredEditComposition />
      <GlassSubsCompositions />
      <IntroEditComposition />
    </>
  );
};
