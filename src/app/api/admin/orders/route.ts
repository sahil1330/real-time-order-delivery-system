import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/connectDb";
import OrderModel from "@/models/order.model";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    
    // Fetch all orders with populated references
    const orders = await OrderModel.find()
      .populate("customer", "name email")
      .populate("deliveryPerson", "name")
      .populate({
        path: "products.product",
        select: "name price image", 
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
