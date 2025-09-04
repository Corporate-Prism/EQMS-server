import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY);
};

// Verify JWT token
export const verifyToken = async (token) => {
  return jwt.verify(token, SECRET_KEY);
};
