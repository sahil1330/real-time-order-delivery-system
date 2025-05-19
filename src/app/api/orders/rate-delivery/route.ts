/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import dbConnect from "@/lib/connectDb";
import DeliveryProfile from "@/models/DeliveryProfile";
import OrderModel from "@/models/order.model";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "customer") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { orderId, rating, comment } = await request.json();

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Order ID and valid rating (1-5) are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the order
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify the order belongs to this customer
    if (order.customer.toString() !== session.user._id) {
      return NextResponse.json(
        { error: "You can only rate your own orders" },
        { status: 403 }
      );
    }

    // Verify the order has been delivered
    if (order.orderStatus !== "delivered") {
      return NextResponse.json(
        { error: "You can only rate delivered orders" },
        { status: 400 }
      );
    }

    // Verify the order hasn't already been rated
    if (order.deliveryRating && order.deliveryRating.rating) {
      return NextResponse.json(
        { error: "You have already rated this delivery" },
        { status: 409 }
      );
    }

    // Update the order with rating
    order.deliveryRating = {
      rating,
      comment: comment || "",
      createdAt: new Date(),
    };
    await order.save();

    // Update the delivery person's profile with the rating
    const deliveryUserId = order.deliveryPerson;
    if (!deliveryUserId) {
      return NextResponse.json(
        { error: "No delivery person assigned to this order" },
        { status: 400 }
      );
    }

    // Find delivery profile
    const deliveryUser = await UserModel.findById(deliveryUserId);
    if (!deliveryUser || deliveryUser.role !== "delivery") {
      return NextResponse.json(
        { error: "Invalid delivery person" },
        { status: 400 }
      );
    }

    // Update the delivery profile with the new rating
    const deliveryProfile = await DeliveryProfile.findOne({
      userId: deliveryUserId,
    });

    if (deliveryProfile) {
      // Add the rating to the delivery profile
      deliveryProfile.ratings.push({
        orderId: order._id,
        rating,
        comment: comment || "",
        date: new Date(),
      });

      // Calculate average rating
      const totalRatings = deliveryProfile.ratings.length;
      interface RatingItem {
        orderId: any;
        rating: number;
        comment: string;
        date: Date;
      }

      const sumRatings: number = deliveryProfile.ratings.reduce(
        (sum: number, item: RatingItem) => sum + item.rating,
        0
      );
      deliveryProfile.averageRating =
        totalRatings > 0 ? sumRatings / totalRatings : 0;

      await deliveryProfile.save();
    }

    // Get the socket.io server instance
    const res: any = NextResponse.next();
    const io = res.socket?.server?.io;

    if (io) {
      // Notify the delivery person about the new rating
      io.to(`user-${deliveryUserId}`).emit("new-rating", {
        orderId,
        rating,
        comment,
      });

      // Notify admin room
      io.to("admin-room").emit("new-rating", {
        orderId,
        deliveryPerson: deliveryUser.name,
        rating,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Delivery rated successfully",
    });
  } catch (error) {
    console.error("Error rating delivery:", error);
    return NextResponse.json(
      { error: "Failed to rate delivery" },
      { status: 500 }
    );
  }
}
