import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SapphireClaim from "@/components/SapphireClaim";

export default function ClaimSapphire() {
  const [userData, setUserData] = useState({ sapphireBalance: 0, dailyClaimed: 0, email: "" });

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUserData({
        sapphireBalance: data.sapphireBalance || 0,
        dailyClaimed: data.dailyClaimed || 0,
        email: data.email || ""
      }))
      .catch(err => console.error("Failed to fetch user:", err));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated userEmail={userData.email} sapphireBalance={userData.sapphireBalance} />

      <main className="pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Daily Sapphire Claim</h1>
            <p className="text-muted-foreground">
              Claim your free sapphires to deploy and manage your bots
            </p>
          </div>

          <SapphireClaim currentClaimed={userData.dailyClaimed} />
        </div>
      </main>
    </div>
  );
}
