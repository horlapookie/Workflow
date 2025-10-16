import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface OTPVerificationProps {
  email?: string;
  onVerify?: (otp: string) => void | Promise<void>;
  onResend?: () => void;
}

export default function OTPVerification({
  email = "user@example.com",
  onVerify = (otp) => console.log("Verify OTP:", otp),
  onResend = () => console.log("Resend OTP"),
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      await onVerify(otp);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    onResend();
  };

  return (
    <Card className="p-8 max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp" className="text-center block">Enter 6-digit code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="text-center text-2xl tracking-widest font-mono"
            data-testid="input-otp"
            maxLength={6}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isVerifying || otp.length !== 6}
          data-testid="button-verify"
        >
          {isVerifying ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying...
            </span>
          ) : (
            "Verify Email"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={handleResend}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-resend"
        >
          Didn't receive the code? Resend
        </button>
      </div>
    </Card>
  );
}
