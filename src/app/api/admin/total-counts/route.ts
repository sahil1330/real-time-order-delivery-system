import { auth } from "@/auth";
import dbConnect from "@/lib/connectDb";
import OrderModel from "@/models/order.model";
import UserModel from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }
  try {
    await dbConnect();

    // Fetch total counts for customers, orders, and delivery personnel
    const totalCustomers = await UserModel.countDocuments({ role: "customer" });
    const totalOrders = await OrderModel.countDocuments();
    const totalRevenue = await OrderModel.aggregate([
      {
        $match: {
          orderStatus: "delivered",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: null,
          totalPrice: {
            $sum: "$productDetails.price",
          },
        },
      },
    ]);

    const totalRevenueAmount = totalRevenue[0]?.totalPrice || 0;

    return NextResponse.json({
      success: true,
      totalCounts: {
        totalCustomers,
        totalOrders,
        totalRevenueAmount,
      },
    });
  } catch (error) {
    console.error("Error fetching total counts:", error);
    return new Response("Failed to fetch total counts", { status: 500 });
  }
}
