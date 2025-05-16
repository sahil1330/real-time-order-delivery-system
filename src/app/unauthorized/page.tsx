"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">401</h1>
        <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8">
          You do not have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
