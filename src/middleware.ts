import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/login",
    "/register",
    "/verify/:path*",
    "/reset-password/:path*",
    "/admin/:path*",
    "/delivery/:path*",
    "/customer/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  if (
    !token &&
    url.pathname !== "/login" &&
    url.pathname !== "/register" &&
    url.pathname !== "/verify" &&
    url.pathname !== "/reset-password" &&
    url.pathname !== "/delivery/login" &&
    url.pathname !== "/delivery/register" &&
    url.pathname !== "/reset-password" &&
    url.pathname !== "/reset-password/request"
  ) {
    const newUrl = new URL("/login", url.origin);
    return Response.redirect(newUrl);
  }
  if (
    token &&
    token.role === "delivery" &&
    (url.pathname === "/login" ||
      url.pathname === "/delivery/login" ||
      url.pathname === "/customer" ||
      url.pathname === "/admin" ||
      url.pathname === "/register" ||
      url.pathname === "/verify" ||
      url.pathname === "/")
  ) {
    const newUrl = new URL("/delivery", url.origin);
    return Response.redirect(newUrl);
  }

  if (
    token &&
    token.role === "customer" &&
    (url.pathname === "/login" ||
      url.pathname === "/admin" ||
      url.pathname === "/delivery" ||
      url.pathname === "/delivery/login" ||
      url.pathname === "/delivery/register" ||
      url.pathname === "/verify" ||
      url.pathname === "/register")
  ) {
    const newUrl = new URL("/customer", url.origin);
    return Response.redirect(newUrl);
  }

  if (
    token &&
    token.role === "admin" &&
    (url.pathname === "/login" ||
      url.pathname === "/register" ||
      url.pathname === "/customer" ||
      url.pathname === "/delivery" ||
      url.pathname === "/delivery/login" ||
      url.pathname === "/delivery/register" ||
      url.pathname === "/" ||
      url.pathname === "/verify")
  ) {
    const newUrl = new URL("/admin", url.origin);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}
