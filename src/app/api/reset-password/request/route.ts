import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/connectDb";
import UserModel from "@/app/models/user.model";
import { generateToken } from "@/lib/helpers/jwt";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { message: "If an account with this email exists, a password reset link has been sent" },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateToken();
    const now = new Date();
    const resetTokenExpiry = new Date(now.getTime() + 60 * 60000); // 1 hour

    // Save token to user
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Get the reset code (first 6 characters)
    const resetCode = resetToken.substring(0, 6).toUpperCase();

    // Send reset email
    await resend.emails.send({
      from: "Order Delivery System <no-reply@yourdomain.com>",
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Reset</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">Hello ${user.name},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Please use the code below to reset your password:</p>
          
          <div style="background-color: #f7f7f7; padding: 15px; margin: 20px 0; text-align: center; border-radius: 5px;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #3a86ff;">${resetCode}</span>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">This code will expire in 1 hour.</p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">If you didn't request a password reset, please ignore this email.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9e9e9; text-align: center; color: #999; font-size: 14px;">
            <p>&copy; ${new Date().getFullYear()} Order Delivery System. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Password reset instructions sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
