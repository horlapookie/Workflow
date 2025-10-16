import StatsCard from "../StatsCard";
import { Users, Server, Activity, Gem } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="p-8 bg-background grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard title="Total Users" value={203} icon={Users} description="+12 this week" />
      <StatsCard title="Active Containers" value={87} icon={Server} description="Running now" />
      <StatsCard title="Today's Deployments" value={24} icon={Activity} description="+8 from yesterday" />
      <StatsCard title="Sapphires Claimed" value="1.2k" icon={Gem} description="This month" />
    </div>
  );
}
