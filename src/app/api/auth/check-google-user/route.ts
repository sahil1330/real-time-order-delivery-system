import dbConnect from "@/lib/connectDb";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();
  const { profile } = await request.json();
  const user = await UserModel.findOne({ email: profile.email });
  if (!user) {
    const password = await bcrypt.hash(profile.sub, 10);
    const newUser = await UserModel.create({
      name: profile.name,
      email: profile.email,
      profilePicture: profile.picture,
      password,
      isVerified: true,
      role: "customer",
    });
    return NextResponse.json(newUser, {
      status: 201,
    });
  }

  return NextResponse.json(user, {
    status: 200,
  });
}
