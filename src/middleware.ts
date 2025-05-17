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
  if (!req.auth && req.nextUrl.pathname !== "/login" && 
      req.nextUrl.pathname !== "/register" && 
      req.nextUrl.pathname !== "/verify" && 
      req.nextUrl.pathname !== "/reset-password" &&
      req.nextUrl.pathname !== "/delivery/login" &&
      req.nextUrl.pathname !== "/delivery/register") {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});
