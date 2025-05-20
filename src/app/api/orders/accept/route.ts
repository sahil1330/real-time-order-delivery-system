import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/connectDb";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "delivery") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // First, lock the order to prevent concurrent acceptances
    const lockedOrder = await OrderModel.findOneAndUpdate(
      {
        _id: orderId,
        orderStatus: "pending",
        isAccepted: false,
        locked: false, // Only lock if not already locked
      },
      {
        locked: true,
        lockExpiresAt: new Date(Date.now() + 30 * 1000), // Lock for 30 seconds
      },
      { new: true }
    );

    if (!lockedOrder) {
      return NextResponse.json(
        { error: "Order not available for acceptance" },
        { status: 409 }
      );
    }

    // Now the delivery person can accept the order
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.isAccepted) {
      return NextResponse.json(
        { error: "Order already accepted by another delivery person" },
        { status: 409 }
      );
    }

    // Update order status directly
    order.orderStatus = "accepted";
    order.isAccepted = true;
    order.deliveryPerson = session.user._id;
    // Add to status history if available
    if (order.statusHistory) {
      order.statusHistory.push({
        status: "accepted",
        timestamp: new Date(),
        updatedBy: session.user._id,
        note: "Order accepted by delivery person",
      });
    }
    order.locked = false; // Release the lock
    await order.save();

    const populatedOrder = await OrderModel.findById(order._id)
      .populate("customer", "name email")
      .populate({
        path: "products.product",
        select: "name price image",
      });

    return NextResponse.json({
      populatedOrder,
      success: true,
      message: "Order accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting order:", error);
    return NextResponse.json(
      { error: "Failed to accept order" },
      { status: 500 }
    );
  }
}
