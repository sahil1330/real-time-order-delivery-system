import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/connectDb";
import UserModel from "@/app/models/user.model";
import { generateToken } from "@/lib/helpers/jwt";
import { sendVerificationEmail } from "@/lib/helpers/sendVerificationEmail";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = "customer" } = body;

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email, isVerified: true });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Check if user is already registered but not verified
    const unverifiedUser = await UserModel.findOne({ email, isVerified: false });
    if (unverifiedUser) {
      // If the user is unverified, we can either resend the verification email or return an error
      // Here we choose to resend the verification email
      const verificationToken = generateToken();
      const now = new Date();
      const verificationTokenExpiry = new Date(now.getTime() + 30 * 60000); // 30 minutes

      unverifiedUser.verificationToken = verificationToken;
      unverifiedUser.verificationTokenExpiry = verificationTokenExpiry;
      await unverifiedUser.save();

      await sendVerificationEmail(email, name, verificationToken);

      return NextResponse.json(
        { message: "Verification email resent. Please check your inbox." },
        { status: 200 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateToken();
    const now = new Date();
    const verificationTokenExpiry = new Date(now.getTime() + 30 * 60000); // 30 minutes

    // Create new user
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    // Send verification email
    await sendVerificationEmail(email, name, verificationToken);

    // Return success response without sensitive info
    return NextResponse.json({ 
      message: "Registration successful. Please check your email for verification code.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

 
