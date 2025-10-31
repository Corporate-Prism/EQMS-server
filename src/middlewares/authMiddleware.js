import mongoose from "mongoose";
import { verifyTokenAndFetchUser } from "../../utils/jwtUtils.js";
import jwt from "jsonwebtoken";
import Auth from "../models/Auth.js";


export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token missing" });
    const { user } = await verifyTokenAndFetchUser(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      console.log("this is user", user)
      if (!user || !user.role || !user.role.roleName) {
        return res.status(403).json({ message: "User role not found" });
      }

      const userRole = user.role.roleName;

      if (!allowedRoles.includes(userRole)) {
        return res
          .status(403)
          .json({ message: `Access denied: requires ${allowedRoles.join(", ")}` });
      }

      next();
    } catch (error) {
      return res.status(403).json({ message: "Authorization failed" });
    }
  };
};

export const authAndAuthorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });
      const token = authHeader.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Token missing" });
      const { user } = await verifyTokenAndFetchUser(token);
      if (!user) return res.status(401).json({ message: "User not found" });
      req.user = user;
      if (allowedRoles.length > 0) {
        if (!user.role || !user.role.roleName) return res.status(403).json({ message: "User role not found" });
        const userRole = user.role.roleName;
        if (!allowedRoles.includes(userRole)) {
          return res
            .status(403)
            .json({ message: `Access denied: requires ${allowedRoles.join(", ")}` });
        }
      }
      next();
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  };
};

export const departmentAccessMiddleware = (req, res, next) => {
  try {
    req.departmentFilter = {};
    if (!req.user) return next();
    const role = req.user.role?.roleName;
    const departmentName = req.user.department?.departmentName;
    const departmentId = req.user.department?._id;
    if (role === "Creator" && departmentName && departmentName !== "QA" && departmentId) {
      req.departmentFilter = { department: new mongoose.Types.ObjectId(departmentId) };
    } else {
      req.departmentFilter = {};
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Department access middleware error", error: error.message });
  }
};

export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    req.user = undefined;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return next();
    if (!authHeader.startsWith("Bearer ")) return next();
    const token = authHeader.split(" ")[1];
    if (!token) return next();
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded._id || decoded.i || decoded.sub;
      if (!userId) return next();
      const user = await Auth.findById(userId).populate("role").populate("department");
      if (!user) return next();
      req.user = user;
      return next();
    } catch (err) {
      return next();
    }
  } catch (err) {
    return next();
  }
};