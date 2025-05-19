/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import dbConnect from "@/lib/connectDb";
import OrderModel from "@/models/order.model";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "customer") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      products,
      totalAmount,
      shippingAddress,
      paymentMethod,
      customerPhone,
      customerEmail,
    } = body;

    if (
      !products ||
      !totalAmount ||
      !shippingAddress ||
      !paymentMethod ||
      !customerPhone
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create order with initial status
    const order = await OrderModel.create({
      customer: session.user._id,
      products: products,
      totalAmount,
      shippingAddress,
      customerPhone,
      customerEmail: customerEmail || session.user.email,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "completed",
      orderStatus: "pending",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          updatedBy: session.user._id,
          note: "Order placed by customer",
        },
      ],
      estimatedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });

    // Add order reference to user
    await UserModel.findByIdAndUpdate(session.user._id, {
      $push: { orders: order._id },
    });

    // Clear user's cart after successful order placement
    await UserModel.findByIdAndUpdate(session.user._id, {
      "cart.products": [],
    }); // Get populated order details for socket notification
    const populatedOrder = await OrderModel.findById(order._id)
      .populate("customer", "name email")
      .populate({
        path: "products.product",
        select: "name price image",
      });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}
