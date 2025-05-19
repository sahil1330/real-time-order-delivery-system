/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?._id) {
      fetchCart();
    }
  }, [session?.user?._id]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products/fetchCart");
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to fetch cart");
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      setCart((prev) =>
        prev.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      const response = await fetch("/api/products/add-product-to-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart");
      }

      const updatedCart = await response.json();
      setCart(updatedCart);
      toast.success("Quantity increased");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to update cart");
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await fetch("/api/products/remove-product-from-cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from cart");
      }

      const updatedCart = await response.json();
      setCart(updatedCart);
      toast.success("Quantity decreased");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to update cart");
    }
  };

  const deleteFromCart = async (productId: string) => {
    try {
      const response = await fetch("/api/products/remove-product-from-cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete from cart");
      }

      const updatedCart = await response.json();
      setCart(updatedCart);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error deleting from cart:", error);
      toast.error("Failed to delete from cart");
    }
  };

  const proceedToCheckout = () => {
    router.push("/customer/checkout");
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Your Cart</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {cart.map((item) => (
                <div key={item.product._id}>
                  <div className="flex items-center py-4">
                    <div className="flex-shrink-0 w-20 h-20 relative rounded overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.product.description.substring(0, 100)}
                        {item.product.description.length > 100 ? "..." : ""}
                      </p>
                      <p className="text-gray-900 font-medium mt-1">
                        ${item.product.price}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product._id)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-3">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addToCart(item.product._id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteFromCart(item.product._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
              <div className="flex justify-between mt-6">
                <Link href="/">
                  <Button variant="outline">Continue Shopping</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">$5.00</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-900 font-bold">Total</span>
                  <span className="text-gray-900 font-bold">
                    ${(calculateTotal() + 5).toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={proceedToCheckout}
                >
                  Checkout
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Taxes and shipping calculated at checkout
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
