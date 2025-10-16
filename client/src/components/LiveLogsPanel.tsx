
import { Card } from "@/components/ui/card";
import { Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface LiveLogsPanelProps {
  botId?: string;
  serverIdentifier?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function LiveLogsPanel({
  botId,
  serverIdentifier,
  isOpen = false,
  onClose = () => console.log("Close logs"),
}: LiveLogsPanelProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Get bot details to extract server identifier
  const { data: bot } = useQuery<{ containerId?: string }>({
    queryKey: ['/api/bots', botId],
    enabled: !!botId && isOpen,
  });

  useEffect(() => {
    if (!isOpen || !botId) {
      return;
    }

    const actualServerIdentifier = serverIdentifier || (bot as any)?.containerId;

    if (!actualServerIdentifier) {
      setLogs(["[INFO] Waiting for server identifier..."]);
      return;
    }

    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WebSocket] Connected to logs server");
      setIsConnected(true);
      setLogs((prev) => [...prev, "[INFO] Connected to bot console..."]);
      
      // Subscribe to bot logs
      ws.send(JSON.stringify({
        type: "subscribe",
        serverIdentifier: actualServerIdentifier,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case "connected":
            setLogs((prev) => [...prev, "[SUCCESS] ✓ Connected to bot console"]);
            break;
          case "log":
            setLogs((prev) => [...prev, message.data]);
            break;
          case "status":
            setLogs((prev) => [...prev, `[STATUS] ${message.data}`]);
            break;
          case "error":
            setLogs((prev) => [...prev, `[ERROR] ${message.message}`]);
            break;
          case "disconnected":
            setLogs((prev) => [...prev, "[WARN] Disconnected from bot console"]);
            setIsConnected(false);
            break;
        }
      } catch (error) {
        console.error("[WebSocket] Error parsing message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("[WebSocket] Error:", error);
      setLogs((prev) => [...prev, "[ERROR] WebSocket connection error"]);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("[WebSocket] Connection closed");
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [isOpen, botId, serverIdentifier, bot]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t-4 border-sapphire" data-testid="panel-live-logs">
      <div className="h-80 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 sticky top-0">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-400">Live Logs</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            data-testid="button-close-logs"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 font-mono text-sm space-y-1">
          {logs.length === 0 ? (
            <div className="text-gray-400">[INFO] Connecting to bot console...</div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`${
                  log.includes("SUCCESS") || log.includes("✓")
                    ? "text-green-400"
                    : log.includes("ERROR") || log.includes("✗")
                    ? "text-red-400"
                    : log.includes("WARN")
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                data-testid={`log-line-${index}`}
              >
                {log}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
