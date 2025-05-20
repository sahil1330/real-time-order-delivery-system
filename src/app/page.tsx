/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { User } from "next-auth";
import Link from "next/link";
import { IProduct } from "@/models/product.model";
import HomePageSkeleton from "@/components/skeltons/HomePageSkeleton";
import { useRouter } from "next/navigation";
export default function Home() {
  const { data: session } = useSession();
  const [isUserSession, setIsUserSession] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [productsInCart, setProductsInCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      fetchProducts();
      if (session?.user._id) {
        setIsUserSession(true);
        setUser(session.user);
        await fetchCart();
      }
    })();
  }, [session?.user._id]);

  useEffect(() => {}, []);
  const fetchCart = async () => {
    try {
      const response = await fetch("/api/products/fetchCart");
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      const data = await response.json();
      setCart(data);
      setProductsInCart(data.map((item: any) => item.product._id));
    } catch (error: { message: string } | any) {
      toast.error(error.message || "Failed to fetch cart");
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products/get-products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error: { message: string } | any) {
      toast.error(error.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };
  const addProductToCart = async (productId: string) => {
    try {
      if (!session?.user) {
        toast.error("Please login to add products to cart");
        router.replace("/login");
        return;
      }
      if (productsInCart.includes(productId)) {
        setCart((prev) =>
          prev.map((item) =>
            item.product._id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        // Add product to productsInCart state to reflect it's now in cart
        setProductsInCart((prev) => [...prev, productId]);
      }

      if (!session?.user) {
        toast.error("Please login to add products to cart");
        return;
      }

      // Make API call to update the cart in the database
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
      toast.success("Product added to cart");
    } catch (error: { message: string } | any) {
      toast.error(error.message || "Failed to add product to cart");
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      if (
        cart.some(
          (item) =>
            item.product._id === productId &&
            (item.quantity === 1 || item.quantity === 0)
        )
      ) {
        // Remove product from productsInCart state
        setProductsInCart((prev) => prev.filter((id) => id !== productId));
        setCart((prev) =>
          prev.filter((item) => item.product._id !== productId)
        );
      } else {
        setCart((prev) =>
          prev.map((item) =>
            item.product._id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
        );
      }
      if (productsInCart.includes(productId)) {
        setCart((prev) =>
          prev.map((item) =>
            item.product._id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
        );
      }
      const response = await fetch("/api/products/remove-product-from-cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove product from cart");
      }

      const updatedCart = await response.json();
      setCart(updatedCart);
      toast.success("Product removed from cart");
    } catch (error: { message: string } | any) {
      toast.error(error.message || "Failed to remove product from cart");
    }
  };

  return (
    <div>
      {" "}
      {isUserSession ? (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Real Time Order</h1>
            <div className="flex items-center space-x-4">
              <Link href="/customer/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </Button>
              </Link>
              <div className="text-sm text-gray-700">
                <span>Welcome, </span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </header>
      ) : (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Real Time Order</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span>Welcome, </span>
                <span className="font-medium">Guest</span>
              </div>
              <Link href={"/login"}>
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </header>
      )}
      {isLoading ? (
        <HomePageSkeleton />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white shadow rounded-lg p-6">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="w-full h-auto rounded-lg mb-4"
                />
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-gray-900 font-bold">₹{product.price}</p>
                {productsInCart.includes(product._id) ? (
                  <div className="isolate flex -space-x-px">
                    <Button
                      variant="outline"
                      className="rounded-r-none focus:z-10"
                      onClick={() => {
                        removeFromCart(product._id);
                      }}
                    >
                      <Minus className="mr-2" />
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-none focus:z-10"
                    >
                      {cart.find((item) => item?.product._id === product._id)
                        ?.quantity || 1}
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-l-none focus:z-10"
                      onClick={() => {
                        addProductToCart(product._id);
                      }}
                    >
                      <Plus className="ml-2" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="default"
                    className="mt-4"
                    onClick={() => {
                      addProductToCart(product._id);
                    }}
                  >
                    Add to Cart <ShoppingCart className="ml-2" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </main>
      )}
      <footer className="bg-white shadow mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2023 Your Company. All rights reserved.
          </p>
        </div>
      </footer>
      <div className="fixed bottom-0 right-0 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
