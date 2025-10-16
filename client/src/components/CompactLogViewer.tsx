import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompactLogViewerProps {
  botId: string;
  isExpanded?: boolean;
}

export default function CompactLogViewer({ botId, isExpanded = false }: CompactLogViewerProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(isExpanded);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!botId) return;

    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/bots/${botId}/logs`);
        if (response.ok) {
          const data = await response.json();
          setLogs(data.logs || []);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);

    return () => clearInterval(interval);
  }, [botId]);

  useEffect(() => {
    if (expanded) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, expanded]);

  const getLogColor = (log: string) => {
    if (log.includes("[SUCCESS]")) return "text-green-400";
    if (log.includes("[ERROR]")) return "text-red-400";
    if (log.includes("[WARN]")) return "text-yellow-400";
    if (log.includes("[INFO]")) return "text-blue-400";
    return "text-gray-300";
  };

  return (
    <div className="mt-4 border border-border rounded-lg overflow-hidden bg-gray-950" data-testid={`log-viewer-${botId}`}>
      <div className="flex items-center justify-between bg-gray-900 px-3 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-green-500" />
          <span className="text-xs font-semibold text-green-500">Live Server Logs</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-green-500">LIVE</span>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          data-testid={`button-toggle-logs-${botId}`}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      <div 
        className={`bg-black font-mono text-xs overflow-y-auto ${
          expanded ? "max-h-96" : "max-h-40"
        } transition-all duration-200`}
        style={{ scrollbarWidth: "thin", scrollbarColor: "#374151 #000000" }}
      >
        <div className="p-3 space-y-1">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div
                key={index}
                className={`${getLogColor(log)} leading-relaxed`}
                data-testid={`log-line-${index}`}
              >
                {log}
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic">Loading logs...</div>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
