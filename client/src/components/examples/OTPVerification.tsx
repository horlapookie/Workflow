import OTPVerification from "../OTPVerification";

export default function OTPVerificationExample() {
  return (
    <div className="p-8 bg-background min-h-screen flex items-center">
      <OTPVerification email="john@example.com" />
    </div>
  );
}
