import SapphireClaim from "../SapphireClaim";

export default function SapphireClaimExample() {
  return (
    <div className="p-8 bg-background min-h-screen flex items-center">
      <SapphireClaim currentClaimed={3} />
    </div>
  );
}
