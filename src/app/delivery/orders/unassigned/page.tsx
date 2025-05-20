/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface UnassignedOrder {
  _id: string;
  totalAmount: number;
  products: any[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  orderStatus: string;
  createdAt: string;
  estimatedDeliveryTime: string;
  locked: boolean;
}

export default function UnassignedOrdersPage() {
  const { socket, joinRoom, sendMessageOrderAccepted } = useSocket();
  const router = useRouter();
  const [orders, setOrders] = useState<UnassignedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnassignedOrders = async () => {
      try {
        const response = await fetch("/api/orders/unassigned");
        if (!response.ok) throw new Error("Failed to fetch unassigned orders");

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching unassigned orders:", error);
        toast("Error", {
          description: "Failed to load unassigned orders",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUnassignedOrders();
  }, []);

  useEffect(() => {
    if (socket && socket.connected) {
      // Join the delivery room to receive updates about new orders
      (async () => await joinRoom("delivery"))();

      // Listen for new unassigned orders
      socket.on("new-unassigned-order", (newOrder: UnassignedOrder) => {
        setOrders((prev) => [newOrder, ...prev]);

        toast("New Order Available", {
          description: `New order is available for pickup`,
        });
      });

      // Listen for order assignments (when another delivery person accepts an order)
      socket.on("order-assigned", (orderId: string) => {
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
      });

      return () => {
        socket.off("new-unassigned-order");
        socket.off("order-assigned");
      };
    }
  }, [socket, joinRoom]);

  const handleAcceptOrder = async (orderId: string) => {
    setAcceptingOrderId(orderId);

    try {
      const response = await fetch("/api/orders/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept order");
      }

      if (data.success) {
        toast("Success", {
          description: "Order accepted successfully!",
        });
        // Emit socket event to notify other delivery partners
        if (socket && socket.connected) {
          await sendMessageOrderAccepted(data.populatedOrder);
        }
        // Remove the accepted order from the list
        setOrders((prev) => prev.filter((order) => order._id !== orderId));

        // Redirect to the delivery dashboard or order detail page
        router.push(`/delivery/orders/${orderId}`);
      } else if (data.locked) {
        toast("Order Unavailable", {
          description:
            "This order is already being processed by another delivery partner",
        });

        // Remove the locked order from the list
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
      }
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error ? error.message : "Failed to accept order",
      });
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Available Orders</h1>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-2 md:px-4">
      <h1 className="text-3xl font-bold mb-8">Available Orders</h1>

      {orders?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="mb-4">
              No orders available for delivery at the moment.
            </p>
            <p className="text-gray-500">
              New orders will appear here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Order #{order._id.substring(0, 8)}
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-800">
                    ₹{order.totalAmount.toFixed(2)}
                  </Badge>
                </div>
                <CardDescription>
                  Placed on {formatDate(order.createdAt)}
                </CardDescription>
              </CardHeader>

              <CardContent className="py-2">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Delivery Location</p>
                    <p className="text-sm text-gray-500">
                      {order.shippingAddress.street},{" "}
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zipCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Order Items</p>
                    <p className="text-sm text-gray-500">
                      {order.products?.length || 0}{" "}
                      {(order.products?.length || 0) === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleAcceptOrder(order._id)}
                  disabled={order.locked || acceptingOrderId === order._id}
                >
                  {acceptingOrderId === order._id
                    ? "Accepting..."
                    : order.locked
                      ? "Already Being Processed"
                      : "Accept Order"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
