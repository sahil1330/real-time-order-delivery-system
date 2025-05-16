"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "admin") {
        // Redirect to appropriate dashboard based on role
        const redirectPath = session.user.role === "delivery" ? "/delivery" : "/customer";
        router.push(redirectPath);
      }
      setLoading(false);
    }
  }, [status, session, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span>Welcome, </span>
              <span className="font-medium">{session?.user?.name}</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Total Customers</h2>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Total Orders</h2>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Revenue</h2>
            <p className="text-3xl font-bold text-purple-600">$0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
            <div className="rounded-md border">
              <div className="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
                No orders found
              </div>
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No recent orders to display</p>
                <Button variant="outline" className="mt-4">View All Orders</Button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Team</h2>
            <div className="rounded-md border">
              <div className="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
                No delivery staff found
              </div>
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No delivery personnel registered yet</p>
                <Button variant="outline" className="mt-4">Add Delivery Staff</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Product Management</h2>
            <Button>Add New Product</Button>
          </div>
          <div className="rounded-md border">
            <div className="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
              No products found
            </div>
            <div className="px-4 py-8 text-center text-gray-500">
              <p>No products added yet</p>
              <p className="mt-2 text-sm">Start adding products to your menu</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
