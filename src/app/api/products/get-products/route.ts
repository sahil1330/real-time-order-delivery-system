import dbConnect from "@/lib/connectDb";
import ProductModel from "@/models/product.model";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  const products = await ProductModel.find();
  if (!products) {
    return NextResponse.json({ error: "No products found" }, { status: 404 });
  }
  return NextResponse.json(products, { status: 200 });
}
