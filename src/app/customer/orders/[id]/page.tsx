/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, use } from "react";
import { useSocket } from "@/context/SocketProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Home, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Step indicator component for order status
const StatusStep = ({
  status,
  label,
  active,
  completed,
}: {
  status: string;
  label: string;
  active: boolean;
  completed: boolean;
}) => {
  return (
    <div className="flex flex-col items-center relative">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center z-10
          ${
            completed
              ? "bg-green-500 text-white"
              : active
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-500"
          }`}
      >
        {completed ? "✓" : status}
      </div>
      <p
        className={`mt-2 text-sm ${active || completed ? "font-medium" : "text-gray-500"}`}
      >
        {label}
      </p>
      <div className="absolute top-4 -right-1/2 h-0.5 w-full bg-gray-200 -z-10">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: completed ? "100%" : "0" }}
        ></div>
      </div>
    </div>
  );
};

interface OrderStatusUpdates {
  status: string;
  timestamp: string;
  updatedBy: string;
  note: string;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { socket, joinRoom } = useSocket();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState<OrderStatusUpdates[]>([]);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const { id } = use(params);
  // Status mapping for the stepper
  const statusSteps = [
    { key: "pending", label: "Order Placed" },
    { key: "accepted", label: "Accepted" },
    { key: "preparing", label: "Preparing" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  // Get current status index
  const getCurrentStatusIndex = () => {
    if (!order) return -1;
    return statusSteps.findIndex((step) => step.key === order.orderStatus);
  };

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
        if (!response.ok) throw new Error("Failed to fetch order details");

        const data = await response.json();
        setOrder(data.order);
        setStatusUpdates(data.order.statusHistory || []);
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
  }, [id]);

  useEffect(() => {
    console.log("Socket", socket);
    if (socket && socket.connected) {
      // Join order-specific room
      (async () => await joinRoom(`order-${id}`))();
      // Listen for order status updates
      
      socket.on(`order-status-update`, (updatedOrder: any) => {
        console.log("Order status updated:", updatedOrder.order);
        setStatusUpdates(updatedOrder.order.statusHistory || []);
        setOrder((prevOrder: any) => ({
          ...prevOrder,
          orderStatus: updatedOrder.order.orderStatus,
          statusHistory: updatedOrder.order.statusHistory,
        }));
        toast("Order Update", {
          description: `Order status updated to ${updatedOrder.order.orderStatus}`,
        });
      });

      return () => {
        socket.off(`order-status-update`);
      };
    }
  }, [joinRoom, socket]);

  const handleSubmitRating = async () => {
    if (!order) return;

    setIsSubmittingRating(true);

    try {
      const response = await fetch("/api/orders/rate-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order._id,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit rating");
      }

      toast("Success", {
        description: "Thank you for your feedback!",
      });

      // Update the local order state with the rating
      setOrder({
        ...order,
        deliveryRating: {
          rating,
          comment,
          createdAt: new Date().toISOString(),
        },
      });

      setIsRatingDialogOpen(false);
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error ? error.message : "Failed to submit rating",
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    } as any;

    return statusColors[status] || "bg-gray-100 text-gray-800";
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
        <Button onClick={() => router.push("/customer/orders")}>
          View All Orders
        </Button>
      </div>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();
  const showRatingOption =
    order.orderStatus === "delivered" && !order.deliveryRating;
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/customer/orders">
            <Button variant="outline" size="sm" className="mr-2">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            Order #{order._id.substring(0, 8)}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link href="/customer/cart">
            <Button variant="outline" size="sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        <Badge className={getStatusColor(order.orderStatus)}>
          {order.orderStatus === "out_for_delivery"
            ? "Out for Delivery"
            : order.orderStatus.charAt(0).toUpperCase() +
              order.orderStatus.slice(1)}
        </Badge>
      </div>

      {/* Order Progress Tracker */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between w-full px-6 py-4">
            {statusSteps.map((step, index) => (
              <StatusStep
                key={step.key}
                status={(index + 1).toString()}
                label={step.label}
                active={index === currentStatusIndex}
                completed={index < currentStatusIndex}
              />
            ))}
          </div>
          {order.estimatedDeliveryTime &&
            order.orderStatus !== "delivered" &&
            order.orderStatus !== "cancelled" && (
              <p className="text-center mt-6 text-gray-600">
                Estimated delivery by: {formatDate(order.estimatedDeliveryTime)}
              </p>
            )}
          {order.orderStatus === "delivered" && order.actualDeliveryTime && (
            <p className="text-center mt-6 text-green-600">
              Delivered on: {formatDate(order.actualDeliveryTime)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Order Details */}
      <div className="grid md:grid-cols-2 gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Shipping Address</h4>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-1">Contact</h4>
                <p>Phone: {order.customerPhone}</p>
                <p>Email: {order.customerEmail}</p>
              </div>

              {order.deliveryPerson && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-1">Delivery Partner</h4>
                  <p>{order.deliveryPerson.name || "Assigned"}</p>
                </div>
              )}

              {order.deliveryRating ? (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-1">Your Rating</h4>
                  <div className="flex items-center">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400">
                          {star <= order.deliveryRating.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <span className="ml-2">
                      {order.deliveryRating.rating}/5
                    </span>
                  </div>
                  {order.deliveryRating.comment && (
                    <p className="mt-1 text-gray-600 italic">
                      &quot;{order.deliveryRating.comment}&quot;
                    </p>
                  )}
                </div>
              ) : (
                showRatingOption && (
                  <div className="pt-4 border-t">
                    <Dialog
                      open={isRatingDialogOpen}
                      onOpenChange={setIsRatingDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">Rate Delivery</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>
                            Rate Your Delivery Experience
                          </DialogTitle>
                          <DialogDescription>
                            Your feedback helps us improve our service. Thank
                            you!
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="flex justify-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="text-3xl focus:outline-none"
                              >
                                <span
                                  className={
                                    star <= rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }
                                >
                                  ★
                                </span>
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="comment" className="text-right">
                              Comment
                            </Label>
                            <Textarea
                              id="comment"
                              placeholder="Share your experience..."
                              className="col-span-3"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={handleSubmitRating}
                            disabled={isSubmittingRating}
                          >
                            {isSubmittingRating
                              ? "Submitting..."
                              : "Submit Rating"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Status Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {statusUpdates.map((update, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 pb-3 border-b last:border-0"
              >
                <div
                  className={`w-2 h-2 mt-2 rounded-full ${getStatusColor(update.status)}`}
                ></div>
                <div>
                  <p className="font-medium">
                    {update.status.charAt(0).toUpperCase() +
                      update.status.slice(1)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(update.timestamp)}
                  </p>
                  {update.note && <p className="text-sm mt-1">{update.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
