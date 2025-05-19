import { auth } from "@/auth";
import dbConnect from "@/lib/connectDb";
import OrderModel from "@/models/order.model";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await dbConnect();
    
    let orders;
    
    // Different queries based on user role
    if (session.user.role === "customer") {
      // Customers can see only their own orders
      orders = await OrderModel.find({ customer: session.user._id })
        .populate("products.product")
        .populate({
          path: "deliveryPerson",
          select: "name email",
        })
        .sort({ createdAt: -1 });
    } else if (session.user.role === "delivery") {
      // Delivery personnel can see orders assigned to them
      orders = await OrderModel.find({ deliveryPerson: session.user._id })
        .populate("products.product")
        .populate({
          path: "customer",
          select: "name email",
        })
        .sort({ createdAt: -1 });
    } else if (session.user.role === "admin") {
      // Admins can see all orders
      orders = await OrderModel.find()
        .populate("products.product")
        .populate({
          path: "customer",
          select: "name email",
        })
        .populate({
          path: "deliveryPerson",
          select: "name email",
        })
        .sort({ createdAt: -1 });
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
