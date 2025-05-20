/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { productId } = await req.json();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!productId) {
    return NextResponse.json({ error: "Product is required" }, { status: 400 });
  }

  const user = session.user;
  const userData = await UserModel.findById(user._id);

  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if the product is already in the cart
  const existingProduct = userData.cart.products.find(
    (item: any) => item.product.toString() === productId
  );
  if (existingProduct) {
    // If the product is already in the cart, increment the quantity
    existingProduct.quantity += 1;
    await userData.populate("cart.products.product");
    await userData.save();
    return NextResponse.json(userData.cart.products, {
      status: 200,
    });
  }
  userData.cart.products.push({
    product: productId,
    quantity: 1,
  });

  await userData.populate("cart.products.product");

  await userData.save();
  if (!userData.cart.products) {
    return NextResponse.json({ error: "Products not found" }, { status: 404 });
  }
  return NextResponse.json(userData.cart.products, {
    status: 200,
  });
}
