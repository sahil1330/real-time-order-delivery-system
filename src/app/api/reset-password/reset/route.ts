import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/connectDb";
import UserModel from "@/models/user.model";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user
    const user = await UserModel.findOne({ 
      email,
      passwordResetTokenExpiry: { $gt: new Date() }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Verify code
    if (!user.passwordResetToken.startsWith(code.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    user.passwordResetToken = "";
    user.passwordResetTokenExpiry = null;
    await user.save();

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
