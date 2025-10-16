import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB, User, Bot } from "./db";
import { loginUser, signupUser, getUserById } from "./auth";
import { generateOTP, sendVerificationEmail } from "./email";
import { createPterodactylServer, controlServer, deleteServer, getServerDetails } from "./pterodactyl";
import { createApiKeyForUser, listUserApiKeys, revokeApiKey } from "./apikeys";
import { apiKeyAuth, type AuthenticatedRequest } from "./middleware/apiAuth";
import { setupWebSocketServer } from "./websocket";
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Connect to MongoDB
  await connectDB();

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const result = await loginUser(email, password);
      
      if (!result.success) {
        return res.status(401).json({ message: result.message });
      }

      // Store user in session
      if (req.session) {
        req.session.userId = result.user!.id;
      }

      res.json(result.user);
    } catch (error) {
      console.error("Login route error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const result = await signupUser(email, password);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      // Store user in session
      if (req.session) {
        req.session.userId = result.user!.id;
      }

      res.json(result.user);
    } catch (error) {
      console.error("Signup route error:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        sapphireBalance: user.sapphireBalance,
        dailyClaimed: user.dailyClaimed,
        lastClaimDate: user.lastClaimDate,
      });
    } catch (error) {
      console.error("Get user route error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.post("/api/auth/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const result = await loginUser(email, password);
      
      if (!result.success) {
        return res.status(401).json({ message: result.message });
      }

      if (!result.user!.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      if (req.session) {
        req.session.userId = result.user!.id;
      }

      res.json(result.user);
    } catch (error) {
      console.error("Admin login route error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP required" });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      if (!user.verificationOTP || !user.otpExpiry) {
        return res.status(400).json({ message: "No verification code found. Please request a new one." });
      }

      if (new Date() > user.otpExpiry) {
        return res.status(400).json({ message: "Verification code expired. Please request a new one." });
      }

      if (user.verificationOTP !== otp) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      user.isVerified = true;
      user.verificationOTP = null as any;
      user.otpExpiry = null as any;
      await user.save();

      // Store user in session
      if (req.session) {
        req.session.userId = user._id.toString();
      }

      res.json({
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          isAdmin: user.isAdmin,
          sapphireBalance: user.sapphireBalance,
          dailyClaimed: user.dailyClaimed,
          lastClaimDate: user.lastClaimDate,
        },
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.verificationOTP = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      const emailSent = await sendVerificationEmail(email, otp);
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }

      res.json({ success: true, message: "Verification code sent to your email" });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ message: "Failed to resend verification code" });
    }
  });

  // Bot management routes (supports both session and API key authentication)
  app.get("/api/bots", apiKeyAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const bots = await Bot.find({ userId });
      res.json(bots);
    } catch (error) {
      console.error("Get bots error:", error);
      res.status(500).json({ message: "Failed to get bots" });
    }
  });

  app.post("/api/bots", apiKeyAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { phone, prefix, sessionId } = req.body;
      
      if (!phone || !sessionId) {
        return res.status(400).json({ message: "Phone and session ID required" });
      }

      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.sapphireBalance < 10) {
        return res.status(400).json({ 
          message: "Insufficient sapphires. You need 10 sapphires to deploy a bot.",
          sapphireBalance: user.sapphireBalance,
        });
      }

      const containerName = `whatsapp-bot-${userId.slice(-8)}-${Date.now()}`;
      
      const pterodactylResult = await createPterodactylServer({
        userId,
        phone,
        prefix: prefix || ".",
        sessionId,
      });

      if (!pterodactylResult.success) {
        return res.status(500).json({ 
          message: pterodactylResult.message || "Failed to create server on Pterodactyl panel" 
        });
      }

      user.sapphireBalance -= 10;
      await user.save();
      
      const bot = new Bot({
        userId: user._id,
        containerName,
        phone,
        prefix: prefix || ".",
        sessionId,
        status: "deploying",
        containerId: pterodactylResult.serverId?.toString() || pterodactylResult.serverIdentifier,
      });

      await bot.save();
      
      res.json({
        ...bot.toObject(),
        pterodactylServerId: pterodactylResult.serverId,
        serverUuid: pterodactylResult.serverUuid,
        sapphireBalance: user.sapphireBalance,
      });
    } catch (error) {
      console.error("Create bot error:", error);
      res.status(500).json({ message: "Failed to create bot" });
    }
  });

  // Sapphire claim route
  app.post("/api/sapphire/claim", async (req, res) => {
    try {
      // Simulate 3 second delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastClaim = user.lastClaimDate ? new Date(user.lastClaimDate) : null;
      const lastClaimDay = lastClaim ? new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate()) : null;
      
      // Reset daily counter if it's a new day
      if (!lastClaimDay || lastClaimDay.getTime() < today.getTime()) {
        user.dailyClaimed = 0;
      }
      
      // Check if user has reached daily limit
      if (user.dailyClaimed >= 10) {
        return res.status(400).json({ 
          message: "Daily limit reached. You can claim more sapphires tomorrow!",
          sapphireBalance: user.sapphireBalance,
          dailyClaimed: user.dailyClaimed,
        });
      }
      
      // Claim sapphire
      user.sapphireBalance += 1;
      user.dailyClaimed += 1;
      user.lastClaimDate = new Date();
      
      await user.save();
      
      res.json({
        sapphireBalance: user.sapphireBalance,
        dailyClaimed: user.dailyClaimed,
      });
    } catch (error) {
      console.error("Claim sapphire error:", error);
      res.status(500).json({ message: "Failed to claim sapphire" });
    }
  });

  // Admin routes - Get all bots (admin only)
  app.get("/api/admin/bots", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await User.findById(userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const bots = await Bot.find({}).populate("userId", "email");
      res.json(bots);
    } catch (error) {
      console.error("Get all bots error:", error);
      res.status(500).json({ message: "Failed to get bots" });
    }
  });

  // Bot control routes (supports both session and API key authentication)
  app.post("/api/bots/:id/control", apiKeyAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { action } = req.body;
      
      if (!["start", "stop", "restart"].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await User.findById(userId);
      const bot = await Bot.findById(id);

      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      if (!user?.isAdmin && bot.userId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!bot.containerId) {
        return res.status(400).json({ message: "Bot has no server identifier" });
      }

      const success = await controlServer(bot.containerId, action as "start" | "stop" | "restart");
      
      if (success) {
        bot.status = action === "start" ? "running" : action === "stop" ? "stopped" : "deploying";
        await bot.save();
        res.json({ 
          success: true, 
          message: `Bot ${action}ed successfully`, 
          bot,
          authMethod: req.authMethod 
        });
      } else {
        res.status(500).json({ message: `Failed to ${action} bot` });
      }
    } catch (error) {
      console.error("Bot control error:", error);
      res.status(500).json({ message: "Failed to control bot" });
    }
  });

  app.delete("/api/bots/:id", apiKeyAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await User.findById(userId);
      const bot = await Bot.findById(id);

      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      if (!user?.isAdmin && bot.userId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Delete from Pterodactyl first
      if (bot.containerId) {
        const deleted = await deleteServer(bot.containerId);
        if (!deleted) {
          console.error(`Failed to delete Pterodactyl server: ${bot.containerId}`);
        }
      }

      // Then delete from database
      await Bot.findByIdAndDelete(id);
      
      res.json({ success: true, message: "Bot deleted successfully" });
    } catch (error) {
      console.error("Delete bot error:", error);
      res.status(500).json({ message: "Failed to delete bot" });
    }
  });

  // Admin stats route
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await User.findById(userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const totalUsers = await User.countDocuments();
      const totalBots = await Bot.countDocuments();
      const runningBots = await Bot.countDocuments({ status: "running" });
      const totalSapphiresClaimed = await User.aggregate([
        { $group: { _id: null, total: { $sum: "$sapphireBalance" } } }
      ]);

      res.json({
        totalUsers,
        totalBots,
        runningBots,
        totalSapphiresClaimed: totalSapphiresClaimed[0]?.total || 0,
      });
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Admin API key management
  app.post("/api/admin/users/:userId/api-keys", async (req, res) => {
    try {
      const adminId = req.session?.userId;
      if (!adminId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const admin = await User.findById(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const { label, expiresInDays } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const result = await createApiKeyForUser(userId, label || "Admin Generated Key", expiresAt);

      if (!result.success) {
        return res.status(500).json({ message: result.message });
      }

      res.json({
        success: true,
        message: "API key created successfully. Make sure to save it - you won't be able to see it again!",
        apiKey: result.rawKey,
        keyId: result.keyId,
        userEmail: user.email,
        createdAt: result.apiKey?.createdAt,
        expiresAt: result.apiKey?.expiresAt,
      });
    } catch (error) {
      console.error("Admin create API key error:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });

  // User API key management
  app.get("/api/users/me/api-keys", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const result = await listUserApiKeys(userId);

      if (!result.success) {
        return res.status(500).json({ message: result.message });
      }

      res.json({ apiKeys: result.apiKeys });
    } catch (error) {
      console.error("List API keys error:", error);
      res.status(500).json({ message: "Failed to list API keys" });
    }
  });

  app.post("/api/users/me/api-keys", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { label, expiresInDays } = req.body;

      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const result = await createApiKeyForUser(userId, label || "CLI API Key", expiresAt);

      if (!result.success) {
        return res.status(500).json({ message: result.message });
      }

      res.json({
        success: true,
        message: "API key created successfully. Make sure to save it - you won't be able to see it again!",
        apiKey: result.rawKey,
        keyId: result.keyId,
        createdAt: result.apiKey?.createdAt,
        expiresAt: result.apiKey?.expiresAt,
      });
    } catch (error) {
      console.error("Create API key error:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });

  app.delete("/api/users/me/api-keys/:keyId", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { keyId } = req.params;

      const result = await revokeApiKey(userId, keyId);

      if (!result.success) {
        return res.status(404).json({ message: result.message });
      }

      res.json({ success: true, message: "API key revoked successfully" });
    } catch (error) {
      console.error("Revoke API key error:", error);
      res.status(500).json({ message: "Failed to revoke API key" });
    }
  });

  // Get bot logs with real-time status updates
  app.get("/api/bots/:id/logs", apiKeyAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const botId = req.params.id;
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const bot = await Bot.findById(botId);
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const user = await User.findById(userId);
      if (!user?.isAdmin && bot.userId.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Check real Pterodactyl status if still deploying
      if (bot.status === "deploying" && bot.containerId) {
        const serverId = parseInt(bot.containerId);
        if (!isNaN(serverId)) {
          const statusResult = await getServerDetails(serverId);
          
          if (statusResult.success && statusResult.isInstalled) {
            // Server is ready, update status to running
            bot.status = "running";
            await bot.save();
          }
        }
      }

      // Fetch real logs from Pterodactyl
      let logs: string[] = [];
      if (bot.containerId) {
        const { getServerLogs } = await import("./pterodactyl");
        const logsResult = await getServerLogs(bot.containerId);
        
        if (logsResult.success && logsResult.logs) {
          logs = logsResult.logs;
        } else {
          logs = [
            "[INFO] Initializing bot deployment...",
            `[INFO] Server ID: ${bot.containerId}`,
            "[INFO] Cloning repository: https://github.com/horlapookie/Horlapookie-bot",
            "[INFO] Configuring bot settings...",
            `[INFO] Phone: ${bot.phone}`,
            `[INFO] Prefix: ${bot.prefix}`,
            "[INFO] Installing npm dependencies...",
            "[INFO] Setting up WhatsApp session...",
          ];
        }
      } else {
        logs = ["[ERROR] No server container found"];
      }

      if (bot.status === "running") {
        logs.push("[SUCCESS] ✓ Bot deployed and running successfully!");
        logs.push(`[INFO] Bot is active with prefix: ${bot.prefix}`);
        logs.push("[INFO] WhatsApp connection established");
      } else if (bot.status === "deploying") {
        logs.push("[INFO] ⏳ Bot deployment in progress...");
        logs.push("[INFO] This may take 30-60 seconds");
      } else if (bot.status === "stopped") {
        logs.push("[WARN] ⚠ Bot is currently stopped");
      }

      res.json({ logs, status: bot.status });
    } catch (error) {
      console.error("Error fetching bot logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server for real-time logs
  setupWebSocketServer(httpServer);

  return httpServer;
}
