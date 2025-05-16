import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

// Generate a random token for email verification or password reset
export const generateToken = () => {
  return randomBytes(32).toString("hex");
};

// Generate JWT token
export const generateJWT = (payload: any, expiresIn = "7d") => {
  const secret = process.env.JWT_SECRET || "default_jwt_secret";
  return jwt.sign(payload, secret, { expiresIn });
};

// Verify JWT token
export const verifyJWT = (token: string) => {
  const secret = process.env.JWT_SECRET || "default_jwt_secret";
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
};
