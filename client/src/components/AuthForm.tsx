import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  mode?: "login" | "signup";
  onSubmit?: (email: string, password: string) => void;
  onSwitchMode?: () => void;
}

export default function AuthForm({
  mode = "login",
  onSubmit = (email, password) => console.log("Auth with", email, password),
  onSwitchMode = () => console.log("Switch mode"),
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      onSubmit(email, password);
      setIsSubmitting(false);
      toast({
        title: mode === "signup" ? "Account created!" : "Logged in!",
        description: mode === "signup" 
          ? "Check your email for verification code" 
          : "Welcome back to HP Hosting",
      });
    }, 1000);
  };

  return (
    <Card className="p-8 max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {mode === "login" ? "Login to HP Hosting" : "Create Your Account"}
        </h2>
        <p className="text-muted-foreground">
          {mode === "login" 
            ? "Enter your credentials to access your dashboard" 
            : "Sign up to start deploying WhatsApp bots"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="input-password"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
          data-testid="button-submit"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {mode === "login" ? "Logging in..." : "Creating account..."}
            </span>
          ) : (
            mode === "login" ? "Login" : "Sign Up"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onSwitchMode}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-switch-mode"
        >
          {mode === "login" 
            ? "Don't have an account? Sign up" 
            : "Already have an account? Login"}
        </button>
      </div>
    </Card>
  );
}
