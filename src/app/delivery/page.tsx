"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function DeliveryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "delivery") {
        // Redirect to appropriate dashboard based on role
        const redirectPath =
          session.user.role === "admin" ? "/admin" : "/customer";
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
          <p className="mt-4 text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Delivery Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span>Welcome, </span>
              <span className="font-medium">{session?.user?.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/delivery/login" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Active Deliveries
          </h2>
          <div className="text-gray-600">
            <p className="mb-4">You have no active deliveries at the moment.</p>
            <div className="flex space-x-4">
              <Button>Go Online</Button>
              <Button variant="outline">View History</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upcoming Orders
            </h2>
            <div className="text-gray-600">
              <p>No upcoming orders to deliver.</p>
              <Link
                href="/delivery/orders/unassigned"
                className="mt-4 inline-block"
              >
                <Button>View unassigned Orders</Button>
              </Link>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Your Profile
            </h2>
            <div className="text-gray-600">
              <p className="mb-2">
                <span className="font-medium">Name:</span> {session?.user?.name}
              </p>
              <p className="mb-2">
                <span className="font-medium">Email:</span>{" "}
                {session?.user?.email}
              </p>
              <p className="mb-2">
                <span className="font-medium">Account Type:</span> Delivery
                Person
              </p>
              <p className="mb-4">
                <span className="font-medium">Status:</span>{" "}
                <Badge className="ml-2" variant="success">
                  <span>Active</span>
                </Badge>
              </p>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Delivery Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600">Deliveries Today</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">₹0</p>
              <p className="text-sm text-gray-600">Today&apos;s Earnings</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">0 min</p>
              <p className="text-sm text-gray-600">Average Delivery Time</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
