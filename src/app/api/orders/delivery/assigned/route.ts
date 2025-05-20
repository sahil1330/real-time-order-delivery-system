import { getServerSession } from "next-auth";
import dbConnect from "@/lib/connectDb";
import OrderModel from "@/models/order.model";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "delivery") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Fetch all orders assigned to this delivery person
    // Exclude delivered and cancelled orders for active view
    const orders = await OrderModel.find({ 
      deliveryPerson: session.user._id,
      orderStatus: { $nin: ["delivered", "cancelled"] }
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "products.product",
        select: "name price image", 
      })
      .populate({
        path: "customer",
        select: "name email",
      });

    return NextResponse.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error("Error fetching assigned orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned orders" },
      { status: 500 }
    );
  }
}
