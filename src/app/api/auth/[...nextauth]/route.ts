import { handlers } from "@/auth" // Referring to the auth.ts we just created
export const { GET, POST } = handlers
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import dbConnect from "@/lib/connectDb";
// import UserModel from "@/app/models/user.model";
// import bcrypt from "bcryptjs";
// import { NextAuthConfig } from "next-auth";
// import { JWT } from "next-auth/jwt";

// export const authConfig: NextAuthConfig = {
//   pages: {
//     signIn: "/login",
//     error: "/error",
//   },
//   callbacks: {
//     async signIn({ user, account }) {
//       if (account?.provider === "google") {
//         try {
//           await dbConnect();
//           const existingUser = await UserModel.findOne({ email: user.email });
          
//           if (!existingUser) {
//             // Create a new user if they don't exist yet
//             const newUser = await UserModel.create({
//               name: user.name,
//               email: user.email,
//               password: "",
//               isVerified: true,
//               profilePicture: user.image || "",
//             });
//           }
//           return true;
//         } catch (error) {
//           console.error("Error during Google sign in:", error);
//           return false;
//         }
//       }
//       return true;
//     },
    
//     async jwt({ token, user, trigger, session }) {
//       if (trigger === "update" && session) {
//         // Handle session updates if needed
//         return { ...token, ...session.user };
//       }
      
//       // Initial sign in
//       if (user) {
//         return {
//           ...token,
//           id: user.id,
//           role: user.role,
//           isVerified: user.isVerified,
//         };
//       }
//       return token;
//     },
    
//     async session({ session, token }) {
//       return {
//         ...session,
//         user: {
//           ...session.user,
//           id: token.id,
//           role: token.role,
//           isVerified: token.isVerified,
//         },
//       };
//     },
//   },
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }
        
//         try {
//           await dbConnect();
//           const user = await UserModel.findOne({ email: credentials.email });
          
//           if (!user || !user.password) {
//             return null;
//           }
          
//           const isPasswordValid = await bcrypt.compare(
//             credentials.password,
//             user.password
//           );
          
//           if (!isPasswordValid) {
//             return null;
//           }
          
//           return {
//             id: user._id.toString(),
//             name: user.name,
//             email: user.email,
//             image: user.profilePicture,
//             role: user.role,
//             isVerified: user.isVerified,
//           };
//         } catch (error) {
//           console.error("Authentication error:", error);
//           return null;
//         }
//       },
//     }),
//   ],
// };

// export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
