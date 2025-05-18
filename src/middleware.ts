import { auth } from "@/auth";

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

export default auth((req) => {
  if (
    !req.auth &&
    req.nextUrl.pathname !== "/login" &&
    req.nextUrl.pathname !== "/register" &&
    req.nextUrl.pathname !== "/verify" &&
    req.nextUrl.pathname !== "/reset-password" &&
    req.nextUrl.pathname !== "/delivery/login" &&
    req.nextUrl.pathname !== "/delivery/register"
  ) {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
  if (
    req.auth &&
    req.auth.user.role === "delivery" &&
    (req.nextUrl.pathname === "/login" ||
      req.nextUrl.pathname === "/delivery/login" ||
      req.nextUrl.pathname === "/customer" ||
      req.nextUrl.pathname === "/admin" ||
      req.nextUrl.pathname === "/register" ||
      req.nextUrl.pathname === "/verify" ||
      req.nextUrl.pathname === "/")
  ) {
    const newUrl = new URL("/delivery", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  if (
    req.auth &&
    req.auth.user.role === "customer" &&
    (req.nextUrl.pathname === "/login" ||
      req.nextUrl.pathname === "/admin" ||
      req.nextUrl.pathname === "/delivery" ||
      req.nextUrl.pathname === "/delivery/login" ||
      req.nextUrl.pathname === "/delivery/register" ||
      req.nextUrl.pathname === "/verify" ||
      req.nextUrl.pathname === "/register")
  ) {
    const newUrl = new URL("/customer", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  if (
    req.auth &&
    req.auth.user.role === "admin" &&
    (req.nextUrl.pathname === "/login" ||
      req.nextUrl.pathname === "/register" ||
      req.nextUrl.pathname === "/customer" ||
      req.nextUrl.pathname === "/delivery" ||
      req.nextUrl.pathname === "/delivery/login" ||
      req.nextUrl.pathname === "/delivery/register" ||
      req.nextUrl.pathname === "/" ||
      req.nextUrl.pathname === "/verify"
    )
  ) {
    const newUrl = new URL("/admin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});
