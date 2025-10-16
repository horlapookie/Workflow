import nodemailer from "nodemailer";
import { config } from "./config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.gmail.user,
    pass: config.gmail.password,
  },
});

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email: string, otp: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: config.gmail.user,
      to: email,
      subject: "Email Verification - Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Email Verification</h2>
          <p>Thank you for signing up! Please use the following OTP code to verify your email address:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #4F46E5; text-align: center; font-size: 36px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #6B7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}
