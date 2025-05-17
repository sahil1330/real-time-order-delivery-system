import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/connectDb";
import User from "@/models/user.model";
import DeliveryProfile from "@/models/DeliveryProfile";
import { sendVerificationEmail } from "@/lib/helpers/sendVerificationEmail";
import { generateToken } from "@/lib/helpers/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      vehicleType,
      vehicleNumber,
      experience,
      role = "delivery",
    } = body;

    // Connect to database
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email, isVerified: true });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create verification token
    const verificationToken = generateToken();

    // Create user with delivery role
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role, // Ensure the role is set to delivery
      isVerified: false,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    // Create delivery profile
    await DeliveryProfile.create({
      userId: newUser._id,
      phone,
      vehicleType,
      vehicleNumber,
      experience: parseFloat(experience),
      isAvailable: false, // Default to not available
    });

    // Send verification email
    await sendVerificationEmail(email, name, verificationToken);

    // Return success response
    return NextResponse.json(
      {
        message:
          "Delivery partner registered successfully. Please check your email to verify your account.",
        userId: newUser._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering delivery partner:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
