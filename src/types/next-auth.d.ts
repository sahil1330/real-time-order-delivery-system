import "next-auth";

declare module "next-auth" {
  interface User {
    _id: string;
    role?: string;
    isVerified?: boolean;
    email?: string;
    name?: string;
    phone?: string;
    address?: string;
    profilePicture?: string;
    cart?: string[];
  }

  interface Session {
    user: {
      _id: string;
      role?: string;
      isVerified?: boolean;
      email?: string;
      name?: string;
      phone?: string;
      address?: string;
      profilePicture?: string;
      cart?: string[];
      token?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    role?: string;
    isVerified?: boolean;
    email?: string;
    name?: string;
    phone?: string;
    address?: string;
    profilePicture?: string;
  }
}
