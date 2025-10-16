import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Users, Server, Activity, Gem } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import AdminTable from "@/components/AdminTable";
import { useToast } from "@/hooks/use-toast";

interface Bot {
  _id: string;
  containerName: string;
  userId: { _id: string; email: string };
  phone: string;
  status: "running" | "stopped" | "deploying";
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalBots: number;
  runningBots: number;
  totalSapphiresClaimed: number;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [bots, setBots] = useState<Bot[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUser();
    fetchBots();
    fetchStats();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (!data.isAdmin) {
          toast({
            title: "Access denied",
            description: "Admin privileges required",
            variant: "destructive",
          });
          setLocation("/dashboard");
        }
        setUser(data);
      } else {
        setLocation("/admin");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setLocation("/admin");
    }
  };

  const fetchBots = async () => {
    try {
      const response = await fetch("/api/admin/bots");
      if (response.ok) {
        const data = await response.json();
        setBots(data);
      }
    } catch (error) {
      console.error("Failed to fetch bots:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
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
        fetchBots();
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
        fetchBots();
        fetchStats();
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

  const transformedBots = bots.map(bot => ({
    id: bot._id,
    containerName: bot.containerName,
    userId: bot.userId?._id || "Unknown",
    userEmail: bot.userId?.email || "Unknown",
    status: bot.status === "deploying" ? "stopped" : bot.status,
    createdAt: new Date(bot.createdAt).toLocaleDateString(),
  })) as any;

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isAuthenticated 
        isAdmin 
        userEmail={user.email} 
        sapphireBalance={user.sapphireBalance} 
      />

      <main className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage all users and containers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatsCard 
              title="Total Users" 
              value={stats?.totalUsers || 0} 
              icon={Users} 
              description="Registered users" 
            />
            <StatsCard 
              title="Active Containers" 
              value={stats?.runningBots || 0} 
              icon={Server} 
              description="Running now" 
            />
            <StatsCard 
              title="Total Deployments" 
              value={stats?.totalBots || 0} 
              icon={Activity} 
              description="All time" 
            />
            <StatsCard 
              title="Sapphires Claimed" 
              value={stats?.totalSapphiresClaimed || 0} 
              icon={Gem} 
              description="Total balance" 
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">All Containers</h2>
            <AdminTable 
              bots={transformedBots}
              onStart={(id) => handleControl(id, "start")}
              onStop={(id) => handleControl(id, "stop")}
              onRestart={(id) => handleControl(id, "restart")}
              onDelete={handleDelete}
              onViewLogs={(id) => console.log("View logs", id)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
