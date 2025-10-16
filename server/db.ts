import mongoose from "mongoose";
import { config } from "./config";

export async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationOTP: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  sapphireBalance: {
    type: Number,
    default: 0,
  },
  dailyClaimed: {
    type: Number,
    default: 0,
  },
  lastClaimDate: {
    type: Date,
    default: null,
  },
  apiKeys: [{
    keyId: {
      type: String,
      required: true,
    },
    hashedKey: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "API Key",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index({ "apiKeys.keyId": 1 });

// Bot Schema
const botSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  containerName: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    default: ".",
  },
  sessionId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["running", "stopped", "deploying"],
    default: "stopped",
  },
  containerId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model("User", userSchema);
export const Bot = mongoose.model("Bot", botSchema);
