
export { auth as middleware } from "@/auth"
// import { NextResponse } from "next/server";
// import { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
  
//   // Paths that are always accessible
//   const publicPaths = ["/login", "/register", "/verify", "/reset-password"];
  
//   // Check if the path is public
//   const isPublicPath = publicPaths.some((path) => 
//     pathname === path || pathname.startsWith(`${path}/`)
//   );
  
//   // Root path redirects to login for non-authenticated users
//   if (pathname === "/") {
//     const token = await getToken({
//       req: request,
//       secret: process.env.NEXTAUTH_SECRET,
//     });
    
//     if (!token) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
    
//     // Redirect based on role
//     const role = token.role as string;
//     if (role === "admin") {
//       return NextResponse.redirect(new URL("/admin", request.url));
//     } else if (role === "delivery") {
//       return NextResponse.redirect(new URL("/delivery", request.url));
//     } else {
//       return NextResponse.redirect(new URL("/customer", request.url));
//     }
//   }
  
//   // Get user token
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });
  
//   // If the user is not logged in and the path is not public, redirect to login
//   if (!token && !isPublicPath) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
  
//   // Role-based access control
//   if (token) {
//     const userRole = token.role as string;
    
//     // Admin area check
//     if (pathname.startsWith("/admin") && userRole !== "admin") {
//       return NextResponse.redirect(new URL("/unauthorized", request.url));
//     }
    
//     // Delivery area check
//     if (pathname.startsWith("/delivery") && userRole !== "delivery") {
//       return NextResponse.redirect(new URL("/unauthorized", request.url));
//     }
    
//     // Customer area check
//     if (pathname.startsWith("/customer") && userRole !== "customer") {
//       return NextResponse.redirect(new URL("/unauthorized", request.url));
//     }
    
//     // If user is already logged in and tries to access login page, redirect to dashboard
//     if (isPublicPath) {
//       if (userRole === "admin") {
//         return NextResponse.redirect(new URL("/admin", request.url));
//       } else if (userRole === "delivery") {
//         return NextResponse.redirect(new URL("/delivery", request.url));
//       } else {
//         return NextResponse.redirect(new URL("/customer", request.url));
//       }
//     }
//   }
  
//   return NextResponse.next();
// }

// // See "Matching Paths" below to learn more
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public (public files)
//      */
//     "/((?!_next/static|_next/image|favicon.ico|public).*)",
//   ],
// };
//     if (pathname.startsWith("/admin") && userRole !== "admin") {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
    
//     // Delivery area check
//     if (pathname.startsWith("/delivery") && userRole !== "delivery") {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
    
//     // Customer area check
//     if (pathname.startsWith("/customer") && userRole !== "customer") {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
    
//     // If the user is already logged in and tries to access login/register pages
//     if (isPublicPath) {
//       // Redirect based on role
//       switch (userRole) {
//         case "admin":
//           return NextResponse.redirect(new URL("/admin", request.url));
//         case "delivery":
//           return NextResponse.redirect(new URL("/delivery", request.url));
//         case "customer":
//           return NextResponse.redirect(new URL("/customer", request.url));
//         default:
//           return NextResponse.redirect(new URL("/", request.url));
//       }
//     }
//   }
  
//   return NextResponse.next();
// }

// // Configure paths that trigger the middleware
// export const config = {
//   matcher: [
//     "/login",
//     "/register",
//     "/verify/:path*",
//     "/reset-password/:path*",
//     "/admin/:path*",
//     "/delivery/:path*",
//     "/customer/:path*",
//   ],
// };
