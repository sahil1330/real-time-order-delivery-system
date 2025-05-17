"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for delivery person registration with additional fields
const deliveryRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .refine(
      (val) => /^\d+$/.test(val),
      "Phone number must contain only digits"
    ),
  vehicleType: z.enum(["bike", "scooter", "car", "van", "other"], {
    required_error: "Please select a vehicle type",
  }),
  vehicleNumber: z
    .string()
    .min(3, "Vehicle number must be at least 3 characters")
    .refine(
      (val) => /^[A-Za-z0-9\s-]+$/.test(val),
      "Vehicle number must contain only letters, numbers, spaces and hyphens"
    ),
  experience: z
    .string()
    .min(1, "Experience field is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0,
      "Experience must be a valid number"
    ),
});

type DeliveryRegisterFormValues = z.infer<typeof deliveryRegisterSchema>;

export default function DeliveryRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DeliveryRegisterFormValues>({
    resolver: zodResolver(deliveryRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      vehicleType: undefined,
      vehicleNumber: "",
      experience: "",
    },
  });

  const onSubmit = async (data: DeliveryRegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/delivery/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          role: "delivery",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      toast("Success", {
        description: "Registration successful! Please verify your email.",
      });

      // Redirect to verification page with email
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (error: Error | unknown) {
      toast("Error", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during registration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10 mb-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Register as Delivery Partner
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleType">Vehicle Type</Label>
          <Select
            onValueChange={(value: string) =>
              setValue(
                "vehicleType",
                value as "bike" | "scooter" | "car" | "van" | "other"
              )
            }
            defaultValue=""
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bike">Bike</SelectItem>
              <SelectItem value="scooter">Scooter</SelectItem>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.vehicleType && (
            <p className="text-sm text-red-500">{errors.vehicleType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleNumber">Vehicle Registration Number</Label>
          <Input
            id="vehicleNumber"
            type="text"
            placeholder="Enter your vehicle number"
            {...register("vehicleNumber")}
          />
          {errors.vehicleNumber && (
            <p className="text-sm text-red-500">
              {errors.vehicleNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Delivery Experience (years)</Label>
          <Input
            id="experience"
            type="number"
            min="0"
            step="0.5"
            placeholder="Enter your experience in years"
            {...register("experience")}
          />
          {errors.experience && (
            <p className="text-sm text-red-500">{errors.experience.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Register as Delivery Partner"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already registered as a delivery partner?{" "}
          <Link
            href="/delivery/login"
            className="text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
