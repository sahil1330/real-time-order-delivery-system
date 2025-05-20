"use client";
import Navbar from "@/components/common/Navbar";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

function Layout({ children }: { children: React.ReactNode }): React.ReactNode {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | undefined>(session?.user);
  useEffect(() => {
    setUser(session?.user);
  }, [session?.user._id]);
  return (
    <div>
      <Navbar user={user} title={"Delivery Dashboard"} />
      {children}
    </div>
  );
}

export default Layout;
