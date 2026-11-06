import { AuditEditComposition, GrowthEditComposition, TiredEditComposition, GlassSubsCompositions, IntroEditComposition, PremiumPreviewComposition, PremiumEditComposition, ChemEditComposition, MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <AuditEditComposition />
      <GrowthEditComposition />
      <TiredEditComposition />
      <GlassSubsCompositions />
      <IntroEditComposition />
      <PremiumPreviewComposition />
      <PremiumEditComposition />
      <ChemEditComposition />
    </>
  );
};
