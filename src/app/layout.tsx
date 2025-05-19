import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/providers";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "Real-Time Order Delivery System",
  description: "Modern order and delivery platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={"antialiased"}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
