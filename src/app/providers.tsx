"use client";

import { SocketProvider } from "@/context/SocketProvider";
import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>{children}</SocketProvider>
    </SessionProvider>
  );
}
