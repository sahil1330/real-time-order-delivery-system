import dbConnect from "@/lib/connectDb";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { credentials } = await request.json();
  await dbConnect();
  const user = await UserModel.findOne({
    email: credentials?.identifier,
  }).select(
    "-passwordResetToken -passwordResetTokenExpiry -verificationToken -verificationTokenExpiry"
  );

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isVerified) {
    throw new Error("User not verified");
  }

  const isPasswordCorrect = await bcrypt.compare(
    credentials?.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid password");
  }

  // Check if this login is from the delivery login page and if the user has the right role
  const isDeliveryLogin = credentials?.callbackUrl?.includes("/delivery");
  if (isDeliveryLogin && user.role !== "delivery" && user.role !== "admin") {
    throw new Error(
      "Access denied. This login is only for delivery personnel."
    );
  }

  return NextResponse.json(user, {
    status: 200,
  });
}
