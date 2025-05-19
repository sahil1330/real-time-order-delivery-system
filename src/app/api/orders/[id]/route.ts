import { auth } from "@/auth";
import dbConnect from "@/lib/connectDb";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Find the order and populate necessary fields
    const order = await OrderModel.findById(orderId)
      .populate("customer", "name email")
      .populate("deliveryPerson", "name")
      .populate({
        path: "products.product",
        select: "name price image", 
      });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if the user is authorized to view this order
    // Allow if user is the customer, the delivery person, or an admin
    const customerId = typeof order.customer === 'object' && order.customer?._id
      ? order.customer._id.toString()
      : order.customer?.toString();
    const isCustomer = customerId === session.user._id;
    
    const deliveryPersonId = order.deliveryPerson && typeof order.deliveryPerson === 'object' && order.deliveryPerson?._id
      ? order.deliveryPerson._id.toString()
      : order.deliveryPerson?.toString();
    const isDeliveryPerson = deliveryPersonId === session.user._id;
    
    const isAdmin = session.user.role === "admin";

    if (!isCustomer && !isDeliveryPerson && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to view this order" }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      order: order
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
