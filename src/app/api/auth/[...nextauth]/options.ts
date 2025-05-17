/* eslint-disable @typescript-eslint/no-explicit-any */
import UserModel from "@/models/user.model";
import dbConnect from "@/lib/connectDb";
import bcrypt from "bcryptjs";
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
export const authOptions: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      checks: ["state", "nonce"],
      async profile(profile: any): Promise<any> {
        await dbConnect();
        const user = await UserModel.findOne({ email: profile.email });
        if (!user) {
          const password = await bcrypt.hash(profile.sub, 10);
          const newUser = await UserModel.create({
            name: profile.name,
            email: profile.email,
            password,
            isVerified: true,
            role: "customer",
          });
          return newUser;
        }
        return user;
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          console.log("Credentials  :", credentials);
          const user = await UserModel.findOne({
            email: credentials?.identifier,
          }).select("+password +isVerified +role +cart");
          console.log("User found:", user);
          if (!user) {
            throw new Error("User not found");
          }

          if (!user.isVerified) {
            throw new Error("User not verified");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials?.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Invalid password");
          }

          return user;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.email = token.email;
        session.user.cart = token.cart;
        session.user.token = token;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Access the raw document data if it's a Mongoose document
        const userData = (user as any)._doc || user;

        if (userData._id) {
          token._id = userData._id.toString();
        } else {
          console.log("No user ID found", user);
        }

        // Copy other properties from user data
        token.role = userData.role || token.role;
        token.isVerified = userData.isVerified || token.isVerified;
        token.email = userData.email || token.email;
        // Add redirect path based on user role
        if (userData.role === "admin") {
          token.redirectPath = "/admin";
        } else if (userData.role === "restaurant") {
          token.redirectPath = "/restaurant";
        } else if (userData.role === "delivery") {
          token.redirectPath = "/delivery";
        } else {
          token.redirectPath = "/"; // Default path for customers
        }
        // Properly serialize cart data to prevent DataCloneError
        if (userData.cart) {
          try {
            // Convert MongoDB documents to plain objects
            token.cart = JSON.parse(JSON.stringify(userData.cart));
          } catch (error) {
            console.error("Failed to serialize cart data:", error);
            token.cart = []; // Fallback to empty cart
          }
        }
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      if (url.startsWith("/")) {
        return new URL(url, baseUrl).toString();
      }
      if (url.startsWith(baseUrl)) {
        return baseUrl;
      }
      return baseUrl;
    },
  },
};
