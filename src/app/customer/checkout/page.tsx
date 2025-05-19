"use client";

import CheckoutForm from "@/components/customer/CheckoutForm";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function CheckoutPage() {

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Complete Your Order</CardTitle>
            </CardHeader>
            <div className="p-6">
              <CheckoutForm />
              
              <div className="mt-6 pt-4 border-t">
                <Link href="/customer/cart">
                  <Button variant="outline">
                    Back to Cart
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

