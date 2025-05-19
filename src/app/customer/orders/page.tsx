/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import Link from "next/link";
import { Home, ShoppingBag, ShoppingCart } from "lucide-react";

interface Order {
  _id: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  products: any[];
  estimatedDeliveryTime: string;
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders/customer");
        if (!response.ok) throw new Error("Failed to fetch orders");

        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewOrder = (orderId: string) => {
    router.push(`/customer/orders/${orderId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PREPARING: "bg-blue-100 text-blue-800",
      OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    } as any;

    const displayStatus = {
      PENDING: "Pending",
      PREPARING: "Preparing",
      OUT_FOR_DELIVERY: "Out for Delivery",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    } as any;

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {displayStatus[status] || status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-24 mt-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">
              Looks like you haven&apos;t placed any orders yet.
            </p>
            <Link href="/">
              <Button>Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order._id.substring(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.orderStatus)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    {order.products.length}{" "}
                    {order.products.length === 1 ? "item" : "items"}
                  </p>
                  <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                </div>

                {order.estimatedDeliveryTime &&
                  order.orderStatus !== "DELIVERED" &&
                  order.orderStatus !== "CANCELLED" && (
                    <p className="text-sm text-gray-700 my-2">
                      <span className="font-medium">Estimated delivery:</span>{" "}
                      {order.estimatedDeliveryTime}
                    </p>
                  )}

                <Button
                  variant="outline"
                  className="mt-2 w-full sm:w-auto"
                  onClick={() => handleViewOrder(order._id)}
                >
                  View Order Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
