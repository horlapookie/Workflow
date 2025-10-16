import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import CreateServerForm from "@/components/CreateServerForm";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CreateServer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const deployMutation = useMutation({
    mutationFn: async (data: { phone: string; prefix: string; sessionId: string }) => {
      return await apiRequest("POST", "/api/bots", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Bot deployed successfully! 🚀",
        description: "Your bot is being set up. Redirecting to dashboard...",
      });
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Deployment failed",
        description: error.message || "Failed to deploy bot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeploy = (data: { phone: string; prefix: string; sessionId: string }) => {
    deployMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isAuthenticated={!!user} 
        userEmail={user?.email} 
        sapphireBalance={user?.sapphireBalance} 
      />

      <main className="pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Bot Server</h1>
            <p className="text-muted-foreground">
              Deploy a new WhatsApp bot in minutes. Each deployment costs 10 sapphires.
            </p>
          </div>

          <CreateServerForm onDeploy={handleDeploy} isDeploying={deployMutation.isPending} />
        </div>
      </main>
    </div>
  );
}
