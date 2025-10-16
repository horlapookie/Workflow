import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RotateCw, Trash2, Terminal } from "lucide-react";
import { useState } from "react";
import CompactLogViewer from "./CompactLogViewer";

interface BotCardProps {
  id: string;
  containerName: string;
  status: "running" | "stopped" | "deploying";
  phone: string;
  prefix: string;
  createdAt: string;
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onDelete?: () => void;
  onViewLogs?: () => void;
}

export default function BotCard({
  id,
  containerName,
  status,
  phone,
  prefix,
  createdAt,
  onStart = () => console.log("Start bot", id),
  onStop = () => console.log("Stop bot", id),
  onRestart = () => console.log("Restart bot", id),
  onDelete = () => console.log("Delete bot", id),
  onViewLogs = () => console.log("View logs", id),
}: BotCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);

  const getStatusColor = () => {
    switch (currentStatus) {
      case "running":
        return "bg-success/10 text-success";
      case "stopped":
        return "bg-muted text-muted-foreground";
      case "deploying":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleStart = () => {
    setCurrentStatus("deploying");
    setTimeout(() => {
      setCurrentStatus("running");
      onStart();
    }, 1000);
  };

  const handleStop = () => {
    setCurrentStatus("deploying");
    setTimeout(() => {
      setCurrentStatus("stopped");
      onStop();
    }, 1000);
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow" data-testid={`card-bot-${id}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-1" data-testid={`text-bot-name-${id}`}>
              {containerName}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">{phone}</p>
          </div>
          <Badge className={`${getStatusColor()} font-medium`} data-testid={`badge-status-${id}`}>
            {currentStatus === "deploying" && (
              <div className="w-2 h-2 mr-1 bg-current rounded-full animate-pulse" />
            )}
            {currentStatus}
          </Badge>
        </div>

        <div className="flex gap-2 text-sm">
          <span className="text-muted-foreground">Prefix:</span>
          <span className="font-mono font-medium">{prefix}</span>
        </div>

        <div className="flex gap-2 text-sm">
          <span className="text-muted-foreground">Created:</span>
          <span>{createdAt}</span>
        </div>

        <div className="flex gap-2 pt-2">
          {currentStatus === "stopped" && (
            <Button
              size="sm"
              variant="default"
              onClick={handleStart}
              data-testid={`button-start-${id}`}
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          )}
          {currentStatus === "running" && (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleStop}
                data-testid={`button-stop-${id}`}
              >
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setCurrentStatus("deploying");
                  setTimeout(() => {
                    setCurrentStatus("running");
                    onRestart();
                  }, 1000);
                }}
                data-testid={`button-restart-${id}`}
              >
                <RotateCw className="w-4 h-4 mr-1" />
                Restart
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            data-testid={`button-delete-${id}`}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>

        <CompactLogViewer botId={id} />
      </div>
    </Card>
  );
}
