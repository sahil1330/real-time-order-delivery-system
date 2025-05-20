// Thisimport { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/connectDb";
import { NextResponse } from "next/server";
import UserModel from "@/models/user.model";

export async function DELETE() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find and clear the cart for this user
    const updatedCart = await UserModel.findByIdAndUpdate(
      session.user._id,
      { $set: { cart: { products: [] } } },
      { new: true } // Return the updated cart
    ).populate("cart.products.product");

    return NextResponse.json(
      { message: "Cart cleared successfully", cart: updatedCart.cart.products },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { message: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
