import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/connectDb";
import OrderModel from "@/models/order.model";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "delivery" && session.user.role !== "admin")) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await dbConnect();
    
    // Find orders that are pending and not yet accepted
    const unassignedOrders = await OrderModel.find({
      orderStatus: "pending",
      isAccepted: false,
      locked: false, // Only show unlocked orders
    })
      .populate("products.product")
      .populate({
        path: "customer",
        select: "name email",
      })
      .sort({ createdAt: 1 }); // Oldest first

    return NextResponse.json(unassignedOrders);
  } catch (error) {
    console.error("Error fetching unassigned orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch unassigned orders" },
      { status: 500 }
    );
  }
}
