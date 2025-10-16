import { WebSocketServer, WebSocket as WS } from "ws";
import { Server } from "http";
import { getWebSocketCredentials } from "./pterodactyl";
import { config } from "./config";

interface PterodactylWebSocketMessage {
  event: string;
  args: string[];
}

export function setupWebSocketServer(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (clientWs, req) => {
    console.log("[WebSocket] Client connected");

    let pterodactylWs: WS | null = null;
    let serverIdentifier: string | null = null;
    let isAuthenticated = false;

    clientWs.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "subscribe" && message.serverIdentifier) {
          serverIdentifier = message.serverIdentifier;

          if (!serverIdentifier) {
            clientWs.send(JSON.stringify({
              type: "error",
              message: "Invalid server identifier",
            }));
            return;
          }

          // Get WebSocket credentials from Pterodactyl
          const credentials = await getWebSocketCredentials(serverIdentifier);

          if (!credentials.success || !credentials.socket || !credentials.token) {
            clientWs.send(JSON.stringify({
              type: "error",
              message: "Failed to get WebSocket credentials",
            }));
            return;
          }

          // Connect to Pterodactyl WebSocket
          pterodactylWs = new WS(credentials.socket, {
            origin: config.pterodactyl.url,
          });

          pterodactylWs.on("open", () => {
            console.log("[WebSocket] Connected to Pterodactyl");

            // Authenticate with Pterodactyl
            pterodactylWs?.send(JSON.stringify({
              event: "auth",
              args: [credentials.token],
            }));
          });

          pterodactylWs.on("message", (pterodactylData) => {
            try {
              const pterodactylMessage: PterodactylWebSocketMessage = JSON.parse(
                pterodactylData.toString()
              );

              // Handle different Pterodactyl events
              switch (pterodactylMessage.event) {
                case "auth success":
                  isAuthenticated = true;
                  console.log("[WebSocket] Authenticated with Pterodactyl");
                  // Request initial logs
                  pterodactylWs?.send(JSON.stringify({
                    event: "send logs",
                    args: [],
                  }));
                  clientWs.send(JSON.stringify({
                    type: "connected",
                    message: "Connected to bot console",
                  }));
                  break;

                case "console output":
                  // Forward console output to client
                  const logLine = pterodactylMessage.args[0];
                  clientWs.send(JSON.stringify({
                    type: "log",
                    data: logLine,
                  }));
                  break;

                case "status":
                  // Forward status updates to client
                  clientWs.send(JSON.stringify({
                    type: "status",
                    data: pterodactylMessage.args[0],
                  }));
                  break;

                case "stats":
                  // Forward stats to client
                  const statsData = JSON.parse(pterodactylMessage.args[0]);
                  clientWs.send(JSON.stringify({
                    type: "stats",
                    data: statsData,
                  }));
                  break;

                case "token expiring":
                case "token expired":
                  console.log("[WebSocket] Token expiring/expired, reconnecting...");
                  // Reconnect to get new token
                  pterodactylWs?.close();
                  break;

                case "jwt error":
                  console.error("[WebSocket] JWT authentication error");
                  clientWs.send(JSON.stringify({
                    type: "error",
                    message: "Authentication failed",
                  }));
                  break;

                default:
                  console.log("[WebSocket] Unhandled event:", pterodactylMessage.event);
              }
            } catch (error) {
              console.error("[WebSocket] Error parsing Pterodactyl message:", error);
            }
          });

          pterodactylWs.on("close", () => {
            console.log("[WebSocket] Pterodactyl connection closed");
            clientWs.send(JSON.stringify({
              type: "disconnected",
              message: "Disconnected from bot console",
            }));
          });

          pterodactylWs.on("error", (error) => {
            console.error("[WebSocket] Pterodactyl error:", error);
            clientWs.send(JSON.stringify({
              type: "error",
              message: "Connection error",
            }));
          });
        } else if (message.type === "command" && isAuthenticated && pterodactylWs) {
          // Send command to Pterodactyl
          pterodactylWs.send(JSON.stringify({
            event: "send command",
            args: [message.command],
          }));
        }
      } catch (error) {
        console.error("[WebSocket] Error handling client message:", error);
      }
    });

    clientWs.on("close", () => {
      console.log("[WebSocket] Client disconnected");
      pterodactylWs?.close();
    });

    clientWs.on("error", (error) => {
      console.error("[WebSocket] Client error:", error);
      pterodactylWs?.close();
    });
  });

  console.log("[WebSocket] Server initialized on path /ws");
  return wss;
}
