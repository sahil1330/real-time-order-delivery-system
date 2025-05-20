/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

import { ShoppingCart } from "lucide-react";
import { signOut } from "next-auth/react";
import { User } from "next-auth";
import { usePathname } from "next/navigation";
function Navbar(props: {
  user: User | undefined;
  cart?: any[];
  title: string | undefined;
}) {
  const { user, cart } = props;
  const pathname = usePathname();
  const isLoginPage = pathname.includes("/login");
  const isRegisterPage = pathname.includes("/register");
  const isDeliveryLoginPage = pathname.includes("/delivery/login");
  const isDeliveryRegisterPage = pathname.includes("/delivery/register");
  const isVerifyPage = pathname.includes("/verify");
  const isResetPasswordPage = pathname.includes("/reset-password");

  if (
    isLoginPage ||
    isRegisterPage ||
    isDeliveryLoginPage ||
    isDeliveryRegisterPage ||
    isVerifyPage ||
    isResetPasswordPage
  ) {
    return;
  }
  return (
    <div>
      {user ? (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {props.title || "Real Time Order"}
            </h1>
            <div className="flex items-center space-x-4">
              {user.role === "customer" && (
                <Link href="/customer/cart">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cart && cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.reduce(
                          (total: number, item: { quantity: number }) =>
                            total + item.quantity,
                          0
                        )}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
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
    </div>
  );
}

export default Navbar;
