import { AuditEditComposition, GrowthEditComposition, TiredEditComposition, GlassSubsCompositions, MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <AuditEditComposition />
      <GrowthEditComposition />
      <TiredEditComposition />
      <GlassSubsCompositions />
    </>
  );
};
