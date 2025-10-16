import crypto from "crypto";
import bcrypt from "bcrypt";
import { User } from "./db";

interface ApiKeyResult {
  success: boolean;
  message?: string;
  rawKey?: string;
  keyId?: string;
  apiKey?: {
    keyId: string;
    label: string;
    createdAt: Date;
    lastUsedAt: Date | null;
    expiresAt: Date | null;
  };
}

export function generateSecureApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashApiKey(rawKey: string): Promise<string> {
  return await bcrypt.hash(rawKey, 10);
}

export async function verifyApiKey(rawKey: string, hashedKey: string): Promise<boolean> {
  return await bcrypt.compare(rawKey, hashedKey);
}

export async function createApiKeyForUser(
  userId: string,
  label: string = "CLI API Key",
  expiresAt: Date | null = null
): Promise<ApiKeyResult> {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const keyId = crypto.randomBytes(16).toString("hex");
    const secret = generateSecureApiKey();
    const hashedKey = await hashApiKey(secret);

    if (!user.apiKeys) {
      user.apiKeys = [] as any;
    }

    user.apiKeys.push({
      keyId,
      hashedKey,
      label,
      createdAt: new Date(),
      lastUsedAt: null,
      expiresAt,
    } as any);

    await user.save();

    return {
      success: true,
      message: "API key created successfully",
      rawKey: `hp_${keyId}_${secret}`,
      keyId,
      apiKey: {
        keyId,
        label,
        createdAt: user.apiKeys[user.apiKeys.length - 1].createdAt,
        lastUsedAt: null,
        expiresAt,
      },
    };
  } catch (error) {
    console.error("Create API key error:", error);
    return { success: false, message: "Failed to create API key" };
  }
}

export async function validateApiKey(rawKey: string): Promise<{
  valid: boolean;
  userId?: string;
  keyId?: string;
}> {
  try {
    if (!rawKey.startsWith("hp_")) {
      return { valid: false };
    }

    const parts = rawKey.split("_");
    if (parts.length !== 3) {
      return { valid: false };
    }

    const keyId = parts[1];
    const secret = parts[2];

    const user = await User.findOne({ "apiKeys.keyId": keyId });

    if (!user || !user.apiKeys) {
      return { valid: false };
    }

    const apiKey = user.apiKeys.find((key: any) => key.keyId === keyId);

    if (!apiKey) {
      return { valid: false };
    }

    const isExpired = apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt);
    if (isExpired) {
      return { valid: false };
    }

    const isValid = await verifyApiKey(secret, apiKey.hashedKey);

    if (isValid) {
      apiKey.lastUsedAt = new Date();
      await user.save();

      return {
        valid: true,
        userId: user._id.toString(),
        keyId: apiKey.keyId,
      };
    }

    return { valid: false };
  } catch (error) {
    console.error("Validate API key error:", error);
    return { valid: false };
  }
}

export async function revokeApiKey(userId: string, keyId: string): Promise<ApiKeyResult> {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (!user.apiKeys || user.apiKeys.length === 0) {
      return { success: false, message: "No API keys found" };
    }

    const initialLength = user.apiKeys.length;
    user.apiKeys = user.apiKeys.filter((key: any) => key.keyId !== keyId) as any;

    if (user.apiKeys.length === initialLength) {
      return { success: false, message: "API key not found" };
    }

    await user.save();

    return {
      success: true,
      message: "API key revoked successfully",
    };
  } catch (error) {
    console.error("Revoke API key error:", error);
    return { success: false, message: "Failed to revoke API key" };
  }
}

export async function listUserApiKeys(userId: string) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const apiKeys = (user.apiKeys || []).map((key: any) => ({
      keyId: key.keyId,
      label: key.label,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      isExpired: key.expiresAt ? new Date() > new Date(key.expiresAt) : false,
    }));

    return {
      success: true,
      apiKeys,
    };
  } catch (error) {
    console.error("List API keys error:", error);
    return { success: false, message: "Failed to list API keys" };
  }
}
