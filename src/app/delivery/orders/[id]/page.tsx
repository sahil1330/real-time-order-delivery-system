/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useState } from "react";
import { useSocket } from "@/context/SocketProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DeliveryOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { socket, joinRoom, sendMessageOrderUpdate } = useSocket();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { id } = use(params);
  const { data: session } = useSession();
  // Status mapping for display
  const statusMap: Record<string, string> = {
    pending: "Pending",
    accepted: "Accepted",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  // Get next possible status options
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

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/get-order?id=${id}`);
        if (!response.ok) throw new Error("Failed to fetch order details");

        const data = await response.json();
        setOrder(data.order);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast("Error", {
          description: "Failed to load order details",
        });
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, session?.user]);

  useEffect(() => {
    if (socket && socket.connected && id) {
      // Join order-specific room
      (async () => await joinRoom(`order-${id}`))();

      // Listen for order status updates
      socket.on(`order-status-update`, (updatedOrder: any) => {
        setOrder((prevOrder: any) => ({
          ...prevOrder,
          orderStatus: updatedOrder.order.orderStatus,
          statusHistory: updatedOrder.order.statusHistory,
        }));
        console.log("Order status updated", updatedOrder.order);
        toast("Order Update", {
          description: `Order status updated to ${updatedOrder.order.orderStatus}`,
        });
      });

      return () => {
        socket.off(`order-status-update`);
      };
    }
  }, [socket, joinRoom, id]);

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    setIsUpdatingStatus(true);

    try {
      const response = await fetch("/api/orders/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order._id,
          status: newStatus,
          note: `Status updated to ${newStatus} by delivery person`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      // Emit the status update to the socket
      console.log("Socket here", socket);
      if (socket && socket.connected) {
        await joinRoom(`order-${data.order._id}`);
        console.log("Emitting order status update ", data.order);
        // socket.emit("update-order", data.order);
        await sendMessageOrderUpdate(data.order);
      }

      // Update the order in our local state
      setOrder({
        ...order,
        orderStatus: newStatus,
        statusHistory: data.order.statusHistory,
      });

      toast("Success", {
        description: `Order status updated to ${newStatus}`,
      });

      // If the order is now delivered, redirect after a delay
      if (newStatus === "delivered") {
        setTimeout(() => {
          router.push("/delivery/orders");
        }, 3000);
      }
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error ? error.message : "Failed to update status",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
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
        {statusMap[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="mb-6">
          The order you&apos;re looking for could not be found.
        </p>
        <Button onClick={() => router.push("/delivery/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 md:px-4 px-2">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="md:text-3xl text-xl font-bold mb-2">
            Order #{order._id.substring(0, 8)}
          </h1>
          <p className="text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        {getStatusBadge(order.orderStatus)}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Customer</h4>
                <p>{order.customer?.name || "Customer"}</p>
                <p>{order.customerEmail}</p>
                <p>{order.customerPhone}</p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-1">Shipping Address</h4>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Items</h4>
                <ul className="space-y-2">
                  {order.products.map((item: any) => (
                    <li key={item._id} className="flex justify-between">
                      <span>
                        {item.product?.name || "Product"} × {item.quantity}
                      </span>
                      <span>
                        ₹{(item.product?.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-1">Payment</h4>
                <p>
                  Method:{" "}
                  {order.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : order.paymentMethod}
                </p>
                <p>
                  Status:{" "}
                  {order.paymentStatus.charAt(0).toUpperCase() +
                    order.paymentStatus.slice(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Update Section */}
      <Card>
        <CardHeader>
          <CardTitle>Update Order Status</CardTitle>
          <CardDescription>
            Change the status of this order as you make progress with the
            delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <p className="font-medium min-w-24">Current Status:</p>
            {getStatusBadge(order.orderStatus)}
          </div>

          {getNextStatusOptions(order.orderStatus).length > 0 && (
            <div className="mt-6 flex items-start space-x-4">
              <p className="font-medium min-w-24 pt-2">Update To:</p>
              <div className="flex-1 flex flex-col space-y-4">
                <Select
                  disabled={isUpdatingStatus}
                  onValueChange={(value) => updateOrderStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getNextStatusOptions(order.orderStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusMap[status] || status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {order.orderStatus === "out_for_delivery" && (
                  <p className="text-sm text-gray-500">
                    When you mark this order as &quot;Delivered&quot;, the
                    customer will be notified and given the option to rate their
                    delivery experience.
                  </p>
                )}
              </div>
            </div>
          )}

          {(order.orderStatus === "delivered" ||
            order.orderStatus === "cancelled") && (
            <p className="mt-4 text-center text-gray-500">
              This order is {order.orderStatus} and cannot be updated further.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          onClick={() => router.push("/delivery/orders")}
        >
          Back to Orders
        </Button>
      </div>
    </div>
  );
}
