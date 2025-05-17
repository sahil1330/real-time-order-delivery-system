import { randomBytes } from "crypto";

// Generate a random token for email verification or password reset
export const generateToken = () => {
  return randomBytes(32).toString("hex");
};


