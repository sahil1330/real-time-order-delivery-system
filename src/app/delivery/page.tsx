"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "@/components/ui/sonner";
import { useSocket } from "@/context/SocketProvider";
import { DeliveryOrder } from "./orders/page";
import { UnassignedOrder } from "./orders/unassigned/page";
import { SheetModel } from "@/components/SheetModel";

export default function DeliveryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { socket, joinRoom } = useSocket();
  const [assignedOrders, setAssignedOrders] = useState<DeliveryOrder[]>([]);
  const [unAssignedOrders, setUnAssignedOrders] = useState<UnassignedOrder[]>(
    []
  );
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

  useEffect(() => {
    const fetchAssignedOrders = async () => {
      try {
        const response = await fetch("/api/orders/delivery/assigned");
        if (!response.ok) throw new Error("Failed to fetch assigned orders");

        const data = await response.json();
        setAssignedOrders(data.orders);
      } catch (error) {
        console.error("Error fetching assigned orders:", error);
        toast("Error", {
          description: "Failed to load your assigned orders",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchUnAssignedOrders = async () => {
      try {
        const response = await fetch("/api/orders/unassigned");
        if (!response.ok) throw new Error("Failed to fetch unassigned orders");

        const data = await response.json();
        setUnAssignedOrders(data);
      } catch (error) {
        console.error("Error fetching unassigned orders:", error);
        toast("Error", {
          description: "Failed to load your unassigned orders",
        });
      }
    };

    fetchAssignedOrders();
    fetchUnAssignedOrders();
  }, []);

  useEffect(() => {
    if (socket && socket.connected) {
      // Join the delivery room to receive updates about new orders
      (async () => await joinRoom("delivery"))();

      // Listen for new unassigned orders
      socket.on("new-unassigned-order", (newOrder: UnassignedOrder) => {
        setUnAssignedOrders((prev) => [newOrder, ...prev]);

        toast("New Order Available", {
          description: `New order is available for pickup`,
        });
      });

      return () => {
        socket.off("new-unassigned-order");
      };
    }
  }, [socket, joinRoom]);

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
      {/* <header className="bg-white shadow">
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
      </header> */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8 relative">
          <div className="flex gap-4 items-center">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Active Deliveries
            </h2>
            <div className="viewAllOrders ">
              <Link href="/delivery/orders">
                <Button variant="outline" className="mb-4">
                  View All Assigned Orders
                </Button>
              </Link>
            </div>
          </div>
          <div className="text-gray-600">
            {assignedOrders.length < 1 ? (
              <p className="mb-4">
                You have no active deliveries at the moment.
              </p>
            ) : (
              assignedOrders.map((order) => (
                <div key={order._id} className="border-b py-4">
                  <p className="font-medium">Order ID: {order._id}</p>
                  <p>Status: {order.orderStatus}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6 relative">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upcoming Orders
            </h2>
            <div className="viewAllOrders absolute top-2 right-4">
              <Link href="/delivery/orders/unassigned">
                <Button variant="outline" className="mt-4">
                  View All Unassigned Orders
                </Button>
              </Link>
            </div>
            <div className="text-gray-600">
              {unAssignedOrders.length < 1 ? (
                <p>No upcoming orders to deliver.</p>
              ) : (
                unAssignedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border-b py-4 flex items-center"
                  >
                    <div>
                      <p className="font-medium">Order ID: {order._id}</p>
                      <p>Status: {order.orderStatus}</p>
                    </div>
                  </div>
                ))
              )}
              {unAssignedOrders.length < 1 && (
                <Link
                  href="/delivery/orders/unassigned"
                  className="mt-4 inline-block"
                >
                  <Button>View unassigned Orders</Button>
                </Link>
              )}
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
              <SheetModel user={session?.user} />
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
