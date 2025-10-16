import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RotateCw, Trash2, Terminal } from "lucide-react";

interface Bot {
  id: string;
  containerName: string;
  userId: string;
  userEmail: string;
  status: "running" | "stopped";
  createdAt: string;
}

interface AdminTableProps {
  bots?: Bot[];
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onRestart?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewLogs?: (id: string) => void;
}

export default function AdminTable({
  bots = [
    {
      id: "1",
      containerName: "bot_user1",
      userId: "userA",
      userEmail: "usera@example.com",
      status: "running",
      createdAt: "2024-01-10",
    },
    {
      id: "2",
      containerName: "bot_user2",
      userId: "userB",
      userEmail: "userb@example.com",
      status: "stopped",
      createdAt: "2024-01-09",
    },
  ],
  onStart = (id) => console.log("Start bot", id),
  onStop = (id) => console.log("Stop bot", id),
  onRestart = (id) => console.log("Restart bot", id),
  onDelete = (id) => console.log("Delete bot", id),
  onViewLogs = (id) => console.log("View logs", id),
}: AdminTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Container Name</TableHead>
            <TableHead className="font-semibold">User</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Created</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bots.map((bot) => (
            <TableRow key={bot.id} data-testid={`row-bot-${bot.id}`}>
              <TableCell className="font-mono text-sm">{bot.containerName}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{bot.userId}</p>
                  <p className="text-sm text-muted-foreground">{bot.userEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    bot.status === "running"
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }
                  data-testid={`badge-status-${bot.id}`}
                >
                  {bot.status}
                </Badge>
              </TableCell>
              <TableCell>{bot.createdAt}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {bot.status === "stopped" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onStart(bot.id)}
                      data-testid={`button-start-${bot.id}`}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onStop(bot.id)}
                        data-testid={`button-stop-${bot.id}`}
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRestart(bot.id)}
                        data-testid={`button-restart-${bot.id}`}
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewLogs(bot.id)}
                    data-testid={`button-logs-${bot.id}`}
                  >
                    <Terminal className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(bot.id)}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-delete-${bot.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
