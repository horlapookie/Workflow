import bcrypt from "bcrypt";
import { User } from "./db";
import { generateOTP, sendVerificationEmail } from "./email";

export async function loginUser(email: string, password: string) {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return { success: false, message: "Invalid email or password" };
    }

    if (!user.isVerified) {
      return { 
        success: false, 
        message: "Email not verified. Please check your email for the verification code.",
        requiresVerification: true,
        userId: user._id.toString(),
      };
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
        sapphireBalance: user.sapphireBalance,
        dailyClaimed: user.dailyClaimed,
        lastClaimDate: user.lastClaimDate,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Login failed" };
  }
}

export async function signupUser(email: string, password: string) {
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return { success: false, message: "Email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      sapphireBalance: 10, // Starting balance
      verificationOTP: otp,
      otpExpiry: otpExpiry,
      isVerified: false,
    });

    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, otp);
    
    if (!emailSent) {
      console.error("Failed to send verification email to:", email);
    }

    return {
      success: true,
      requiresVerification: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        isVerified: user.isVerified,
      },
    };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: "Signup failed" };
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
      sapphireBalance: user.sapphireBalance,
      dailyClaimed: user.dailyClaimed,
      lastClaimDate: user.lastClaimDate,
    };
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
