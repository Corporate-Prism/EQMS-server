import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Auth from "../src/models/Auth.js";
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

export const verifyTokenAndFetchUser = async (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await Auth.findById(decoded.id)
      .populate("role department")
      .lean();
    if (!user)throw new Error("User not found");
    return { user, decoded };
  } catch (error) {
    throw new Error(error.message || "Invalid or expired token");
  }
};