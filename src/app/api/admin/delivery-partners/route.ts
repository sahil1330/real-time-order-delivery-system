import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/connectDb";
import DeliveryProfile from "@/models/DeliveryProfile";
import UserModel from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await dbConnect();

    // Find all users with delivery role
    const deliveryUsers = await UserModel.find({ role: "delivery" }).select(
      "_id name email isVerified createdAt"
    );

    // Get their delivery profiles
    const deliveryProfiles = await DeliveryProfile.find({
      userId: { $in: deliveryUsers.map((user) => user._id) },
    });

    // Combine user data with profile data
    const deliveryPartners = deliveryUsers.map((user) => {
      const profile = deliveryProfiles.find(
        (profile) => profile.userId.toString() === user._id.toString()
      );

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        phone: profile?.phone || "",
        vehicleType: profile?.vehicleType || "",
        vehicleNumber: profile?.vehicleNumber || "",
        experience: profile?.experience || 0,
        isAvailable: profile?.isAvailable || false,
        averageRating: profile?.averageRating || 0,
        totalRatings: profile?.ratings?.length || 0,
      };
    });

    return NextResponse.json(deliveryPartners);
  } catch (error) {
    console.error("Error fetching delivery partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery partners" },
      { status: 500 }
    );
  }
}
