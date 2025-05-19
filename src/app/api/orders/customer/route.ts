import { auth } from "@/auth";
import dbConnect from "@/lib/connectDb";
import OrderModel from "@/models/order.model";
import {  NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "customer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Fetch all orders for the current customer, sorted by creation date
    const orders = await OrderModel.find({ customer: session.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "products.product",
        select: "name price image", 
      });

    return NextResponse.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
