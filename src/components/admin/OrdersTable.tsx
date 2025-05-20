/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Order {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  deliveryPerson: {
    _id: string;
    name: string;
  } | null;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersTable() {
  const { joinRoom, socket } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders");
        if (!response.ok) throw new Error("Failed to fetch orders");

        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast("Error", {
          description: "Failed to load orders",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      // Join admin room to receive updates
      joinRoom("admin");

      // Listen for order status updates
      socket.on(
        "order-status-update",
        (data: {
          order: {
            _id: string;
            orderStatus: string;
            statusHistory: [
              {
                timestamp: string;
              },
            ];
          };
        }) => {
          setOrders((prev) =>
            prev.map((order) =>
              order._id === data.order._id
                ? {
                    ...order,
                    orderStatus: data.order.orderStatus,
                    statusHistory: data.order.statusHistory,
                    updatedAt:
                      data.order.statusHistory[
                        data.order.statusHistory.length - 1
                      ].timestamp,
                  }
                : order
            )
          );

          toast("Order Update", {
            description: `Order ${data.order._id.substring(0, 8)} updated to ${data.order.orderStatus}`,
          });
        }
      );

      // Listen for new orders
      socket.on("new-order", (newOrder: Order) => {
        setOrders((prev) => [newOrder, ...prev]);

        toast("New Order", {
          description: `New order received from ${newOrder.customer?.name || "a customer"}`,
        });
      });

      return () => {
        socket.off("order-status-update");
        socket.off("new-order");
      };
    }
  }, [socket, joinRoom]);

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
    return <div className="flex justify-center py-8">Loading orders...</div>;
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Delivery Person</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    {order._id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    {order.customer?.name || "Unknown"} <br />
                    <span className="text-xs text-gray-500">
                      {order.customer?.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    {order.deliveryPerson?.name || "Not Assigned"}
                  </TableCell>
                  <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        (window.location.href = `/admin/orders/${order._id}`)
                      }
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
