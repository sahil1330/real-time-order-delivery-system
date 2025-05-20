/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface LiveOrder {
  _id: string;
  customer: {
    name: string;
  };
  deliveryPerson: {
    name: string;
  } | null;
  totalAmount: number;
  orderStatus: string;
  lastUpdated: string;
}

export default function LiveOrderTracking() {
  const { joinRoom, socket } = useSocket();
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders");
        if (!response.ok) throw new Error("Failed to fetch orders");

        const data = await response.json();
        // Filter only active orders (not delivered or cancelled)
        const activeOrders = data.orders
          .filter(
            (order: any) =>
              !["delivered", "cancelled"].includes(order.orderStatus)
          )
          .map((order: any) => ({
            _id: order._id,
            customer: order.customer,
            deliveryPerson: order.deliveryPerson,
            totalAmount: order.totalAmount,
            orderStatus: order.orderStatus,
            lastUpdated: order.updatedAt || order.createdAt,
          }));

        setLiveOrders(activeOrders);
      } catch (error) {
        console.error("Error fetching active orders:", error);
        toast("Error", {
          description: "Failed to load active orders",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrders();
    console.log("Socket", socket);
    if (socket) {
      // Join admin room to receive updates
      (async () => await joinRoom("admin"))();
      // Listen for order status updates
      socket.on("order-status-update", (data: any) => {
        setLiveOrders((prev) => {
          // Update existing order if it's in our list
          const orderExists = prev.some(
            (order) => order._id === data.order._id
          );

          if (orderExists) {
            // If the order is now delivered or cancelled, remove it from live view
            if (
              data.order.orderStatus === "delivered" ||
              data.order.orderStatus === "cancelled"
            ) {
              return prev.filter((order) => order._id !== data.order._id);
            }

            // Otherwise update its status
            return prev.map((order) =>
              order._id === data.order._id
                ? {
                    ...order,
                    orderStatus: data.order.orderStatus,
                    lastUpdated: data.order.statusHistory.timestamp,
                  }
                : order
            );
          }

          return prev;
        });
        console.log(" Order status updated:", data);
      });

      // Listen for new orders
      socket.on(
        "new-order",
        (newOrder: {
          _id: any;
          customer: any;
          deliveryPerson: any;
          totalAmount: any;
          orderStatus: any;
          createdAt: any;
        }) => {
          const liveOrderData = {
            _id: newOrder._id,
            customer: newOrder.customer,
            deliveryPerson: newOrder.deliveryPerson,
            totalAmount: newOrder.totalAmount,
            orderStatus: newOrder.orderStatus,
            lastUpdated: newOrder.createdAt,
          };

          setLiveOrders((prev) => [liveOrderData, ...prev]);
        }
      );

      // Listen for order assignments
      socket.on(
        "order-accepted",
        (data: { orderId: string; deliveryPerson: any }) => {
          setLiveOrders((prev) =>
            prev.map((order) =>
              order._id === data.orderId
                ? {
                    ...order,
                    orderStatus: "accepted",
                    deliveryPerson: { name: data.deliveryPerson },
                    lastUpdated: new Date().toISOString(),
                  }
                : order
            )
          );
        }
      );

      return () => {
        socket.off("order-status-update");
        socket.off("new-order");
        socket.off("order-accepted");
      };
    }
  }, [socket, joinRoom]);

  // useEffect(() => {}, [socket, joinRoom]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-indigo-100 text-indigo-800",
    } as Record<string, string>;

    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        Loading live order tracking...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Live Order Status</h3>
        <span className="text-sm text-gray-500">
          {liveOrders.length} active order{liveOrders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {liveOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-gray-500">No active orders at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveOrders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex justify-between">
                  <span>#{order._id.substring(0, 8)}</span>
                  <Badge className={getStatusColor(order.orderStatus)}>
                    {order.orderStatus === "out_for_delivery"
                      ? "Out for Delivery"
                      : order.orderStatus.charAt(0).toUpperCase() +
                        order.orderStatus.slice(1)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Last updated: {formatTime(order.lastUpdated)}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Customer:</span>
                    <span className="font-medium">
                      {order.customer?.name || "Unknown"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery:</span>
                    <span className="font-medium">
                      {order.deliveryPerson?.name || "Not Assigned"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
