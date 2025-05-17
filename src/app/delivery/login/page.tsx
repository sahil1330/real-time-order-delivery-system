"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const deliveryLoginSchema = z.object({
  identifier: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  remember: z.boolean().optional(),
});

type DeliveryLoginFormValues = z.infer<typeof deliveryLoginSchema>;

export default function DeliveryLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      const userRole = session.user.role;
      // If already logged in as delivery person, go to delivery dashboard
      if (userRole === "delivery") {
        router.push("/delivery");
      } else if (userRole === "admin") {
        // Admin can access everything
        router.push("/admin");
      } else {
        // If logged in as regular customer, go to unauthorized page
        // since this login is only for delivery personnel
        router.push("/unauthorized");
      }
    }
  }, [status, session, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryLoginFormValues>({
    resolver: zodResolver(deliveryLoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: DeliveryLoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
        callbackUrl: "/delivery", // Add callbackUrl to indicate this is a delivery login
      });

      if (result?.error) {
        toast("Login Failed", {
          description: result.error,
        });
      } else {
        // Check if the user is a delivery person
        const session = await fetch("/api/auth/session");
        const sessionData = await session.json();
        
        if (sessionData?.user?.role !== "delivery") {
          toast("Access Denied", {
            description: "This login is only for delivery personnel. Please use the regular login page.",
          });
          // Sign the user out
          signIn("", { callbackUrl: "/unauthorized" });
        } else {
          toast("Login Successful", {
            description: "Welcome back, delivery partner!",
          });
          // Redirect to delivery dashboard
          router.push("/delivery");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast("Error", {  
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Delivery Partner Login</h1>
      <p className="text-center text-gray-600 mb-6">
        Sign in to manage your deliveries and earnings
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("identifier")}
          />
          {errors.identifier && (
            <p className="text-sm text-red-500">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/reset-password/request"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="remember" {...register("remember")} />
          <Label htmlFor="remember" className="text-sm font-normal">
            Remember me
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In as Delivery Partner"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Not registered as a delivery partner?{" "}
          <Link href="/delivery/register" className="text-blue-600 hover:underline">
            Register now
          </Link>
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Regular customer login
        </Link>
      </div>
    </div>
  );
}