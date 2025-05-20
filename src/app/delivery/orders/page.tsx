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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeliveryOrder {
  _id: string;
  orderStatus: string;
  totalAmount: number;
  products: any[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  customerPhone: string;
  customerEmail: string;
  createdAt: string;
  estimatedDeliveryTime: string;
}

export default function DeliveryAssignedOrdersPage() {
  const { socket } = useSocket();
  const router = useRouter();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignedOrders = async () => {
      try {
        const response = await fetch("/api/orders/delivery/assigned");
        if (!response.ok) throw new Error("Failed to fetch assigned orders");

        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching assigned orders:", error);
        toast("Error", {
          description: "Failed to load your assigned orders",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedOrders();
  }, []);

  useEffect(() => {
    if (socket && socket.connected) {
      // Listen for order status updates
      socket.on(
        "order-status-update",
        (data: { statusHistory: any; orderStatus: any; _id: string }) => {
          setOrders((prev) =>
            prev.map((order) =>
              order._id === data._id
                ? {
                    ...order,
                    orderStatus: data.orderStatus,
                    statusHistory: data.statusHistory,
                    updatedAt: data.statusHistory.timestamp,
                  }
                : order
            )
          );
          // If the order is delivered, we might want to remove it from the active list
          if (data.orderStatus === "delivered") {
            setTimeout(() => {
              setOrders((prev) =>
                prev.filter((order) => order._id !== data._id)
              );
            }, 5000); // Remove after 5 seconds
          }
        }
      );

      return () => {
        socket.off("order-status-update");
      };
    }
  }, [socket]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch("/api/orders/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          note: `Status updated to ${newStatus} by delivery person`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      // Update the order in our local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );

      toast("Success", {
        description: `Order status updated to ${newStatus}`,
      });

      // If the order is now delivered, we might want to remove it from the list after a delay
      if (newStatus === "delivered") {
        setTimeout(() => {
          setOrders((prev) => prev.filter((order) => order._id !== orderId));
        }, 5000); // Remove after 5 seconds
      }
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error ? error.message : "Failed to update status",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextStatusOptions = (currentStatus: string) => {
    const statusFlow = {
      accepted: ["preparing"],
      preparing: ["out_for_delivery"],
      out_for_delivery: ["delivered"],
      delivered: [],
      cancelled: [],
    } as Record<string, string[]>;

    return statusFlow[currentStatus] || [];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    } as any;

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status === "out_for_delivery"
          ? "Out for Delivery"
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Your Assigned Orders</h1>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Your Assigned Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="mb-4">You don&apos;t have any assigned orders yet.</p>
            <Button onClick={() => router.push("/delivery/orders/unassigned")}>
              Find Orders to Deliver
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Order #{order._id.substring(0, 8)}
                  </CardTitle>
                  {getStatusBadge(order.orderStatus)}
                </div>
                <CardDescription>
                  Placed on {formatDate(order.createdAt)}
                </CardDescription>
              </CardHeader>

              <CardContent className="py-2">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Delivery Address</p>
                    <p className="text-sm text-gray-500">
                      {order.shippingAddress.street},{" "}
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zipCode}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Customer Contact</p>
                    <p className="text-sm text-gray-500">
                      Phone: {order.customerPhone} | Email:{" "}
                      {order.customerEmail}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Order Summary</p>
                    <p className="text-sm text-gray-500">
                      {order.products.length} items | Total: ₹
                      {order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-col space-y-3">
                <div className="w-full flex items-center space-x-2">
                  <Select
                    disabled={
                      updatingOrderId === order._id ||
                      getNextStatusOptions(order.orderStatus).length === 0
                    }
                    onValueChange={(value) =>
                      updateOrderStatus(order._id, value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {getNextStatusOptions(order.orderStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === "out_for_delivery"
                            ? "Out for Delivery"
                            : status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/delivery/orders/${order._id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
