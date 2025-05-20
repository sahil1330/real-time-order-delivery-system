import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/connectDb";
import UserModel from "@/models/user.model";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, phone, address } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Create an update object with the fields that are provided
    const updateData: { name: string; phone?: string; address?: string } = { name };
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
      // Find and update the user
    const updatedUser = await UserModel.findByIdAndUpdate(
      session.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("name email phone address role profilePicture");
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
      return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
