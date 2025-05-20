/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";

import {
  HomeIcon,
  LayoutDashboard,
  ScrollText,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
    <div>      {user ? (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            {/* Logo/Title Section */}
            <div className="flex items-center">
              {user.role === "customer" && (
                <Link href="/customer">
                  <h1 className="text-xl font-bold text-gray-900">
                    {props.title || "Real Time Order"}
                  </h1>
                </Link>
              )}
              {user.role === "delivery" && (
                <Link href="/delivery">
                  <h1 className="text-xl font-bold text-gray-900">
                    {props.title || "Real Time Order"}
                  </h1>
                </Link>
              )}
              {user.role === "admin" && (
                <Link href="/admin">
                  <h1 className="text-xl font-bold text-gray-900">
                    {props.title || "Real Time Order"}
                  </h1>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user.role === "customer" && (
                <Link href="/">
                  <Button variant="ghost" size="sm" className="relative">
                    <HomeIcon className="h-5 w-5" />
                    Home
                  </Button>
                </Link>
              )}
              {user && (
                <Link href={`/${user.role}`}>
                  <Button variant="ghost" size="sm" className="relative">
                    <LayoutDashboard className="h-5 w-5" />
                    My Dashboard
                  </Button>
                </Link>
              )}
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
                    )}{" "}
                    View Cart
                  </Button>
                </Link>
              )}
              {user && (
                <Link href={`/${user.role}/orders`}>
                  <Button variant="ghost" size="sm" className="relative">
                    <ScrollText className="h-5 w-5" />
                    My Orders
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
          
          {/* Mobile Navigation Menu - Slide down when open */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
              <div className="flex flex-col space-y-2 px-4 py-3">
                {user.role === "customer" && (
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <HomeIcon className="h-5 w-5 mr-2" />
                      Home
                    </Button>
                  </Link>
                )}
                {user && (
                  <Link href={`/${user.role}`} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <LayoutDashboard className="h-5 w-5 mr-2" />
                      My Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === "customer" && (
                  <Link href="/customer/cart" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start relative">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {cart && cart.length > 0 && (
                        <span className="absolute top-0 left-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cart.reduce(
                            (total: number, item: { quantity: number }) =>
                              total + item.quantity,
                            0
                          )}
                        </span>
                      )}
                      View Cart
                    </Button>
                  </Link>
                )}
                {user && (
                  <Link href={`/${user.role}/orders`} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <ScrollText className="h-5 w-5 mr-2" />
                      My Orders
                    </Button>
                  </Link>
                )}
                <div className="text-sm text-gray-700 py-2 px-2">
                  <span>Welcome, </span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </header>
      ) : (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Real Time Order</h1>
            
            {/* Mobile menu button for guest */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* Desktop Navigation for guest */}
            <div className="hidden md:flex items-center space-x-4">
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
          
          {/* Mobile Navigation Menu for guest */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
              <div className="flex flex-col space-y-2 px-4 py-3">
                <div className="text-sm text-gray-700 py-2 px-2">
                  <span>Welcome, </span>
                  <span className="font-medium">Guest</span>
                </div>
                <Link href={"/login"} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </header>
      )}
    </div>
  );
}

export default Navbar;
