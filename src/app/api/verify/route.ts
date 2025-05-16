import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/connectDb";
import UserModel from "@/app/models/user.model";
import { generateToken } from "@/lib/helpers/jwt";
import { sendVerificationEmail } from "@/lib/helpers/sendVerificationEmail";
import { signIn } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verificationCode } = body;

    if (!email || !verificationCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user
    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        {
          message: "Email is already verified",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
          },
        },
        { status: 200 }
      );
    }

    // Extract the first 6 characters of the token to compare with the code
    const storedCode = user.verificationToken.substring(0, 6).toUpperCase();

    // Verify if the code is correct
    if (verificationCode.toUpperCase() !== storedCode) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if the token is expired
    if (user.verificationTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Verification code expired" },
        { status: 400 }
      );
    } // Mark user as verified
    user.isVerified = true;
    user.verificationToken = "";
    user.verificationTokenExpiry = new Date(0); // Set to epoch time
    await user.save();
    // Sign in the user after verification
    try {
      await signIn("credentials", { 
        email: user.email,
        isVerified: true,
        redirect: false
      });
    } catch (signInError) {
      console.error("Error signing in user after verification:", signInError);
      // Continue with verification response even if sign-in fails
    }
    // Send success response
    return NextResponse.json(
      {
        message: "Email verified successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// For resending verification code
export async function PUT(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = generateToken();
    const now = new Date();
    const verificationTokenExpiry = new Date(now.getTime() + 30 * 60000); // 30 minutes

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, user.name, verificationToken);

    return NextResponse.json({
      message: "Verification code resent. Please check your email.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "An error occurred while resending verification code" },
      { status: 500 }
    );
  }
}
