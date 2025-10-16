import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";
import { login } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      const userResponse = await fetch("/api/auth/me");
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const userData = await userResponse.json();
      
      toast({
        title: "Login successful!",
        description: "Welcome back to HP Hosting",
      });
      
      if (userData?.isAdmin === true) {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <AuthForm mode="login" onSubmit={handleLogin} onSwitchMode={() => setLocation("/signup")} />
        </div>
      </main>
    </div>
  );
}
