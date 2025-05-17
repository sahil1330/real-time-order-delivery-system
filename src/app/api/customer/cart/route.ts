import UserModel from "@/models/user.model";
import { auth } from "@/auth";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import CartModel from "@/models/cart.model";
import dbConnect from "@/lib/connectDb";

export async function GET() {
  const session = await auth();
  console.log("Session:", session);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user: User = session.user;
  await dbConnect();
  const cart = await UserModel.findById(user._id)
    .populate('cart')
    .select("cart");
  if (!cart) {
    return new Response("Cart not found", { status: 404 });
  }
  return NextResponse.json(cart, {
    status: 200,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const user: User = session.user;
  const { productId } = await request.json();
  if (!productId) {
    return new Response("Product not found", { status: 404 });
  }

  const updatedCart = await UserModel.findByIdAndUpdate(user._id, {
    $push: {
      cart: productId,
    },
  }).populate("cart.productId");

  return NextResponse.json(updatedCart, {
    status: 200,
  });
}
