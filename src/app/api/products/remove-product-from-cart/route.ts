/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const { productId } = await req.json();
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!productId) {
    return new Response("Product is required", { status: 400 });
  }
  const user = session.user;
  const userData = await UserModel.findById(user._id);
  if (!userData) {
    return new Response("User not found", { status: 404 });
  }
  // Check if the product is in the cart
  const existingProduct = userData.cart.products.find(
    (item: any) => item.product.toString() === productId
  );

  if (!existingProduct) {
    return new Response("Product not found in cart", { status: 404 });
  }

  if (existingProduct.quantity > 1) {
    userData.cart.products = userData.cart.products.map((item: any) => {
      if (item.product.toString() === productId) {
        item.quantity -= 1;
      }
      return item;
    });
  } else {
    userData.cart.products = userData.cart.products.filter(
      (item: any) => item.product.toString() !== productId
    );
  }
  await userData.populate("cart.products.product");
  await userData.save();
  if (!userData.cart.products) {
    return new Response("Products not found", { status: 404 });
  }
  return NextResponse.json(userData.cart.products, {
    status: 200,
  });
}
