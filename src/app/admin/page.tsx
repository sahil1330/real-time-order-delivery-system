"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrdersTable from "@/components/admin/OrdersTable";
import DeliveryPartnersTable from "@/components/admin/DeliveryPartnersTable";
import LiveOrderTracking from "@/components/admin/LiveOrderTracking";
import { toast } from "@/components/ui/sonner";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [countData, setCountData] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "admin") {
        // Redirect to appropriate dashboard based on role
        const redirectPath =
          session.user.role === "delivery" ? "/delivery" : "/customer";
        router.push(redirectPath);
      }
      setLoading(false);
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchTotalCounts = async () => {
      try {
        const response = await fetch("/api/admin/total-counts");
        if (!response.ok) throw new Error("Failed to fetch total counts");

        const data = await response.json();
        setCountData({
          totalCustomers: data.totalCounts.totalCustomers || 0,
          totalOrders: data.totalCounts.totalOrders || 0,
          revenue: data.totalCounts.totalRevenueAmount || 0,
        });
      } catch (error) {
        console.error("Error fetching total counts:", error);
        toast.error("Failed to fetch total counts");
      }
    };
    fetchTotalCounts();
  }, []);

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
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Total Customers
            </h2>
            <p className="text-3xl font-bold text-blue-600">
              {countData.totalCustomers || 0}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Total Orders
            </h2>
            <p className="text-3xl font-bold text-green-600">
              {countData.totalOrders || 0}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Revenue</h2>
            <p className="text-3xl font-bold text-purple-600">
              ₹{countData.revenue || 0}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <Tabs defaultValue="orders">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="orders">All Orders</TabsTrigger>
              <TabsTrigger value="delivery-partners">
                Delivery Partners
              </TabsTrigger>
              <TabsTrigger value="live-tracking">Live Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <OrdersTable />
            </TabsContent>

            <TabsContent value="delivery-partners">
              <DeliveryPartnersTable />
            </TabsContent>

            <TabsContent value="live-tracking">
              <LiveOrderTracking />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//           <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
//           <div className="flex items-center space-x-4">
//             <div className="text-sm text-gray-700">
//               <span>Welcome, </span>
//               <span className="font-medium">{session?.user?.name}</span>
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => signOut({ callbackUrl: "/login" })}
//             >
//               Sign Out
//             </Button>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white shadow rounded-lg p-6 text-center">
//             <h2 className="text-lg font-medium text-gray-900 mb-2">Total Customers</h2>
//             <p className="text-3xl font-bold text-blue-600">0</p>
//           </div>
//           <div className="bg-white shadow rounded-lg p-6 text-center">
//             <h2 className="text-lg font-medium text-gray-900 mb-2">Total Orders</h2>
//             <p className="text-3xl font-bold text-green-600">0</p>
//           </div>
//           <div className="bg-white shadow rounded-lg p-6 text-center">
//             <h2 className="text-lg font-medium text-gray-900 mb-2">Revenue</h2>
//             <p className="text-3xl font-bold text-purple-600">₹0</p>
//           </div>
//         </div>

//         {/* Tabs for different admin functionalities */}
//         <div className="bg-white shadow rounded-lg p-6">
//           <div className="mb-6">
//             <ul className="flex border-b">
//               <li className="mr-1">
//                 <a href="#orders" className="inline-block py-2 px-4 text-blue-500 hover:text-blue-800 font-medium border-b-2 border-blue-500">
//                   All Orders
//                 </a>
//               </li>
//               <li className="mr-1">
//                 <a href="#delivery" className="inline-block py-2 px-4 text-gray-500 hover:text-blue-800 font-medium">
//                   Delivery Partners
//                 </a>
//               </li>
//               <li className="mr-1">
//                 <a href="#tracking" className="inline-block py-2 px-4 text-gray-500 hover:text-blue-800 font-medium">
//                   Live Tracking
//                 </a>
//               </li>
//             </ul>
//           </div>

//           <div id="orders" className="px-1">
//             <h2 className="text-lg font-medium text-gray-900 mb-4">All Orders</h2>
//             <div className="rounded-md border">
//               <div className="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
//                 Order Management
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Person</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     <tr>
//                       <td className="px-6 py-4 whitespace-nowrap" colSpan={7}>
//                         <div className="text-center text-gray-500 py-8">
//                           <p>No orders to display</p>
//                         </div>
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="mt-8 bg-white shadow rounded-lg p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-medium text-gray-900">Product Management</h2>
//             <Button>Add New Product</Button>
//           </div>
//           <div className="rounded-md border">
//             <div className="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
//               No products found
//             </div>
//             <div className="px-4 py-8 text-center text-gray-500">
//               <p>No products added yet</p>
//               <p className="mt-2 text-sm">Start adding products to your menu</p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
