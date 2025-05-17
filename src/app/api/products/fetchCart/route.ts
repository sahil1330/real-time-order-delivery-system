import { auth } from "@/auth";
import dbConnect from "@/lib/connectDb";
import UserModel from "@/models/user.model";
import { User } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user: User = session.user;
  await dbConnect();

  const cart = await UserModel.findById(user._id)
    .populate("cart.products.product")
    .select("cart");

  if (!cart) {
    return new Response("Cart not found", { status: 404 });
  }

  return NextResponse.json(cart.cart.products, {
    status: 200,
  });
}
