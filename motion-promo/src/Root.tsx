import { AuditEditComposition, GrowthEditComposition, TiredEditComposition, MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <AuditEditComposition />
      <GrowthEditComposition />
      <TiredEditComposition />
    </>
  );
};
