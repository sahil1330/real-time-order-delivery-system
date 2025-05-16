/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";


export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast("Email is missing. Please go back to registration.");
      return;
    }
    
    if (!code) {
      toast("Error",{
        description: "Please enter the verification code.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, verificationCode: code }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }
      
      toast("Success",{
        description: data.message || "Email verified successfully",
      });
      
      // Auto signin user
      const role = data.user?.role || "customer";

      // Add delay before redirect to show success message
      setTimeout(() => {
        if (role === "admin") {
          router.push("/admin");
        } else if (role === "delivery") {
          router.push("/delivery");
        } else {
          router.push("/customer");
        }
      }, 1500);
      
    } catch (error: any) {
      toast("Error",{
        description: error.message || "An error occurred during verification",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    if (!email) {
      toast("Error",{
        description: "Email is missing. Please go back to registration.",
      });
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch("/api/verify", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification code");
      }

      toast("Success", {
        description: data.message || "Verification code resent to your email",
      });

    } catch (error: any) {
      toast("Error", {
        description: error.message || "An error occurred while resending the code",
      });
    } finally {
      setIsResending(false);
    }
  };
  
  if (!email) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-20">
        <h1 className="text-2xl font-bold mb-6 text-center">Verification Failed</h1>
        <p className="text-gray-700 mb-4 text-center">
          Email address is missing. Please go back to registration.
        </p>
        <div className="flex justify-center">
          <Link href="/register">
            <Button className="w-full">Go to Registration</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-20">
      <h1 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h1>
      <p className="text-gray-700 mb-6 text-center">
        We&apos;ve sent a verification code to <span className="font-medium">{email}</span>. 
        Please enter the code below to verify your email address.
      </p>
      
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-2">
          <Input
            id="code"
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center text-xl tracking-wider"
            maxLength={6}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Email"}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Didn&apos;t receive a code?
        </p>
        <Button
          variant="outline"
          onClick={handleResendCode}
          disabled={isResending}
          className="text-sm"
        >
          {isResending ? "Sending..." : "Resend Code"}
        </Button>
      </div>
      
      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
