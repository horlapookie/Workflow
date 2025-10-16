
import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";
import OTPVerification from "@/components/OTPVerification";
import { signup } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleSignup = async (email: string, password: string) => {
    try {
      await signup(email, password);
      setUserEmail(email);
      setShowOTPVerification(true);
      toast({
        title: "Account created!",
        description: "Please check your email for the verification code",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: userEmail, otp }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Verification failed");
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Email verified!",
        description: "Welcome to HP Hosting",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to resend code");
      }

      toast({
        title: "Code sent!",
        description: "Check your email for a new verification code",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend",
        description: error.message || "Could not resend verification code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {showOTPVerification ? (
            <OTPVerification
              email={userEmail}
              onVerify={handleVerifyOTP}
              onResend={handleResendOTP}
            />
          ) : (
            <AuthForm
              mode="signup"
              onSubmit={handleSignup}
              onSwitchMode={() => setLocation("/login")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
