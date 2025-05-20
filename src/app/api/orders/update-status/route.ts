import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/connectDb";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "delivery" && session.user.role !== "admin")
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { orderId, status, note } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Valid status transitions based on current status
    const validTransitions: Record<string, string[]> = {
      pending: ["accepted", "cancelled"],
      accepted: ["preparing", "cancelled"],
      preparing: ["out_for_delivery", "cancelled"],
      out_for_delivery: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    await dbConnect();

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if delivery person is authorized to update this order
    if (
      session.user.role === "delivery" &&
      order.deliveryPerson?.toString() !== session.user._id &&
      status !== "accepted" // Allow accepting unassigned orders
    ) {
      return NextResponse.json(
        { error: "You are not assigned to this order" },
        { status: 403 }
      );
    }

    // Validate status transition
    if (!validTransitions[order.orderStatus].includes(status)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${order.orderStatus} to ${status}`,
          validTransitions: validTransitions[order.orderStatus],
        },
        { status: 400 }
      );
    }

    // Update order status
    order.orderStatus = status;
    order.statusHistory.push({
      status,
      updatedBy: session.user._id,
      note: note || "",
      timestamp: new Date(),
    });
    await order.save();


    return NextResponse.json({
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        statusHistory: order.statusHistory,
      },
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
