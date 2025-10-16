import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Gem } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import BotCard from "@/components/BotCard";
import { getCurrentUser, logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
  });

  const { data: bots = [] } = useQuery<any[]>({
    queryKey: ["/api/bots"],
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handleControl = async (id: string, action: "start" | "stop" | "restart") => {
    try {
      const response = await fetch(`/api/bots/${id}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Bot ${action}ed successfully`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || `Failed to ${action} bot`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to control bot",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bot? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/bots/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bot deleted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to delete bot",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bot",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isAuthenticated 
        userEmail={user.email} 
        sapphireBalance={user.sapphireBalance}
        isAdmin={user.isAdmin}
        onLogout={handleLogout}
      />

      <main className="pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, <span className="text-sapphire">{user.email.split('@')[0]}</span> 👋
            </h1>
            <p className="text-muted-foreground">Manage your WhatsApp bots and deployments</p>
          </div>

          <Card className="mb-8 p-6 bg-gradient-to-br from-sapphire/10 to-sapphire/5 border-sapphire/20">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sapphire/20 rounded-full">
                  <Gem className="w-8 h-8 text-sapphire" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-medium mb-1">Your Sapphire Balance</p>
                  <p className="text-4xl font-bold text-sapphire" data-testid="text-dashboard-sapphire-balance">
                    {user.sapphireBalance}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Each bot deployment costs 10 sapphires
              </p>
            </div>
          </Card>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Your Active Bots</h2>
            <Link href="/create-server">
              <Button data-testid="button-create-new-server">
                <Plus className="w-4 h-4 mr-2" />
                Create New Server
              </Button>
            </Link>
          </div>

          {bots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot: any) => (
                <BotCard 
                  key={bot._id} 
                  id={bot._id}
                  containerName={bot.containerName}
                  status={bot.status}
                  phone={bot.phone}
                  prefix={bot.prefix}
                  createdAt={new Date(bot.createdAt).toLocaleDateString()}
                  onStart={() => handleControl(bot._id, "start")}
                  onStop={() => handleControl(bot._id, "stop")}
                  onRestart={() => handleControl(bot._id, "restart")}
                  onDelete={() => handleDelete(bot._id)}
                  onViewLogs={() => console.log("View logs", bot._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No bots deployed yet</p>
              <Link href="/create-server">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Deploy Your First Bot
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
