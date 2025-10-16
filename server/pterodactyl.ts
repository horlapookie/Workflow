import { config } from "./config";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createGzip } from "zlib";
import { pipeline } from "stream/promises";
import archiver from "archiver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CreateServerParams {
  userId: string;
  phone: string;
  prefix: string;
  sessionId: string;
}

interface PterodactylServerResponse {
  object: string;
  attributes: {
    id: number;
    uuid: string;
    identifier: string;
    name: string;
  };
}

const PANEL_URL = config.pterodactyl.url;
const API_KEY = config.pterodactyl.apiKey;
const CLIENT_API_KEY = config.pterodactyl.clientApiKey;
const NODE_ID = 1; // Default node ID

async function createBotArchive(sessionId: string, prefix: string, phone: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const botTemplatePath = path.join(__dirname, '..', 'bot-template');
    const chunks: Buffer[] = [];
    
    const archive = archiver('tar', {
      gzip: true
    });

    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    // Add all bot files except SESSION-ID and config.js
    archive.glob('**/*', {
      cwd: botTemplatePath,
      ignore: ['SESSION-ID', 'config.js']
    });

    // Add SESSION-ID file with user's session
    archive.append(sessionId, { name: 'SESSION-ID' });

    // Read and modify config.js
    const configPath = path.join(botTemplatePath, 'config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Replace prefix
    configContent = configContent.replace(/prefix:\s*['"](.*?)['"],/, `prefix: '${prefix}',`);
    
    // Replace ownerNumber
    configContent = configContent.replace(/ownerNumber:\s*['"](.*?)['"],/, `ownerNumber: '${phone}',`);
    
    archive.append(configContent, { name: 'config.js' });

    archive.finalize();
  });
}

async function uploadBotFiles(serverIdentifier: string, archiveBuffer: Buffer, retries = 5): Promise<boolean> {
  try {
    if (!CLIENT_API_KEY) {
      console.error('Client API key not configured');
      return false;
    }

    // Step 1: Get signed upload URL with retry logic for server installation
    let urlResponse;
    for (let attempt = 1; attempt <= retries; attempt++) {
      urlResponse = await fetch(
        `${PANEL_URL}/api/client/servers/${serverIdentifier}/files/upload`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CLIENT_API_KEY}`,
            'Accept': 'Application/vnd.pterodactyl.v1+json',
          },
        }
      );

      if (urlResponse.ok) {
        break;
      }

      const errorText = await urlResponse.text();
      
      // Check if it's a server installation error (409 conflict)
      if (urlResponse.status === 409 && attempt < retries) {
        console.log(`[SETUP] Server still installing, waiting... (attempt ${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        continue;
      }

      console.error('Failed to get upload URL:', errorText);
      return false;
    }

    if (!urlResponse || !urlResponse.ok) {
      return false;
    }

    const urlData = await urlResponse.json();
    const uploadUrl = urlData.attributes?.url;

    if (!uploadUrl) {
      console.error('No upload URL received');
      return false;
    }

    // Step 2: Upload file to signed URL using native FormData
    const blob = new Blob([archiveBuffer], { type: 'application/gzip' });
    const formData = new FormData();
    formData.append('files', blob, 'bot.tar.gz');

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      console.error('File upload failed:', await uploadResponse.text());
      return false;
    }

    console.log('[SETUP] Bot files uploaded successfully');
    return true;
  } catch (error) {
    console.error('Error uploading bot files:', error);
    return false;
  }
}

async function getAvailableAllocation(nodeId: number): Promise<number | null> {
  try {
    const response = await fetch(`${PANEL_URL}/api/application/nodes/${nodeId}/allocations`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to get allocations");
      return null;
    }

    const data = await response.json();
    const availableAllocation = data.data?.find((alloc: any) => !alloc.attributes.assigned);

    return availableAllocation?.attributes?.id || null;
  } catch (error) {
    console.error("Error getting allocations:", error);
    return null;
  }
}

export async function createPterodactylServer(params: CreateServerParams): Promise<{
  success: boolean;
  serverId?: number;
  serverUuid?: string;
  serverIdentifier?: string;
  message?: string;
}> {
  try {
    const allocationId = await getAvailableAllocation(NODE_ID);

    if (!allocationId) {
      return {
        success: false,
        message: "No available ports on server. Please contact administrator.",
      };
    }

    const serverName = `whatsapp-bot-${params.userId.slice(-8)}`;

    // Smart startup script - handles both first run and manual restarts
    const startupScript = `cd /home/container && if [ -f package.json ]; then echo '[SETUP] Bot files found, installing dependencies...' && npm install && echo '[SETUP] Starting bot...' && npm start; elif [ -f bot.tar.gz ]; then echo '[SETUP] Extracting bot files...' && tar -xzf bot.tar.gz && rm bot.tar.gz && echo '[SETUP] Installing dependencies...' && npm install && echo '[SETUP] Starting bot...' && npm start; else echo '[SETUP] Waiting for bot files...' && sleep 30 && if [ -f bot.tar.gz ]; then tar -xzf bot.tar.gz && rm bot.tar.gz && npm install && npm start; else echo '[ERROR] Bot files not found' && exit 1; fi; fi`;

    const serverData = {
      name: serverName,
      user: 29,
      egg: 15,
      docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
      startup: startupScript,
      environment: {
        USER_UPLOAD: "1",
        AUTO_UPDATE: "0",
        CMD_RUN: "npm start",
        BOT_SESSION_ID: params.sessionId,
        BOT_PREFIX: params.prefix,
        BOT_PHONE: params.phone,
      },
      limits: {
        memory: 512,
        swap: 0,
        disk: 1024,
        io: 500,
        cpu: 50,
      },
      feature_limits: {
        databases: 0,
        allocations: 1,
        backups: 0,
      },
      allocation: {
        default: allocationId,
      },
      start_on_completion: true,
    };

    // Create bot archive with user's settings
    console.log('[SETUP] Creating bot archive with user settings...');
    const botArchive = await createBotArchive(params.sessionId, params.prefix, params.phone);

    const response = await fetch(`${PANEL_URL}/api/application/servers`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(serverData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Pterodactyl API error:", errorData);
      return {
        success: false,
        message: `Failed to create server: ${response.statusText}`,
      };
    }

    const data: PterodactylServerResponse = await response.json();

    // Upload bot files to the server
    console.log('[SETUP] Uploading bot files to server...');
    const uploadSuccess = await uploadBotFiles(data.attributes.identifier, botArchive);
    
    if (!uploadSuccess) {
      console.error('[SETUP] Failed to upload bot files, but server was created');
    }

    return {
      success: true,
      serverId: data.attributes.id,
      serverUuid: data.attributes.uuid,
      serverIdentifier: data.attributes.identifier,
    };
  } catch (error) {
    console.error("Error creating Pterodactyl server:", error);
    return {
      success: false,
      message: "Internal error while creating server",
    };
  }
}

export async function getServerStatus(serverId: number): Promise<{
  success: boolean;
  status?: string;
  message?: string;
}> {
  try {
    const response = await fetch(`${PANEL_URL}/api/application/servers/${serverId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to get server status",
      };
    }

    const data = await response.json();

    return {
      success: true,
      status: data.attributes.container?.installed ? "installed" : "installing",
    };
  } catch (error) {
    console.error("Error getting server status:", error);
    return {
      success: false,
      message: "Internal error while checking server status",
    };
  }
}

export async function deleteServer(serverIdOrIdentifier: string | number): Promise<boolean> {
  try {
    // Try to parse as number first (old format), otherwise use as identifier
    const serverId = typeof serverIdOrIdentifier === 'number' 
      ? serverIdOrIdentifier 
      : parseInt(serverIdOrIdentifier);
    
    if (isNaN(serverId)) {
      console.error("Invalid server ID:", serverIdOrIdentifier);
      return false;
    }

    const response = await fetch(`${PANEL_URL}/api/application/servers/${serverId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to delete server ${serverId}:`, response.statusText);
    }

    return response.ok;
  } catch (error) {
    console.error("Error deleting server:", error);
    return false;
  }
}

export async function controlServer(
  serverIdentifier: string, 
  action: "start" | "stop" | "restart" | "kill"
): Promise<boolean> {
  try {
    const response = await fetch(`${PANEL_URL}/api/client/servers/${serverIdentifier}/power`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ signal: action }),
    });

    return response.ok;
  } catch (error) {
    console.error(`Error ${action}ing server:`, error);
    return false;
  }
}

export async function getServerDetails(serverId: number): Promise<{
  success: boolean;
  status?: string;
  isInstalled?: boolean;
  message?: string;
}> {
  try {
    const response = await fetch(`${PANEL_URL}/api/application/servers/${serverId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to get server details",
      };
    }

    const data = await response.json();

    return {
      success: true,
      status: data.attributes.suspended ? "suspended" : "active",
      isInstalled: data.attributes.container?.installed || false,
    };
  } catch (error) {
    console.error("Error getting server details:", error);
    return {
      success: false,
      message: "Internal error while getting server details",
    };
  }
}

export async function getServerLogs(serverIdentifier: string): Promise<{
  success: boolean;
  logs?: string[];
  message?: string;
}> {
  try {
    const response = await fetch(`${PANEL_URL}/api/client/servers/${serverIdentifier}/logs`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to fetch server logs",
      };
    }

    const data = await response.json();
    const logs = data.data?.map((log: any) => log.line || log) || [];

    return {
      success: true,
      logs: logs.slice(-50), // Return last 50 lines
    };
  } catch (error) {
    console.error("Error fetching server logs:", error);
    return {
      success: false,
      message: "Internal error while fetching logs",
    };
  }
}

export async function getWebSocketCredentials(serverIdentifier: string): Promise<{
  success: boolean;
  socket?: string;
  token?: string;
  message?: string;
}> {
  try {
    const response = await fetch(
      `${PANEL_URL}/api/client/servers/${serverIdentifier}/websocket`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Accept": "Application/vnd.pterodactyl.v1+json",
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to get WebSocket credentials",
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      socket: data.data.socket,
      token: data.data.token,
    };
  } catch (error) {
    console.error("Error getting WebSocket credentials:", error);
    return {
      success: false,
      message: "Internal error while getting WebSocket credentials",
    };
  }
}