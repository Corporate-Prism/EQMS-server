import mongoose from "mongoose";
import { verifyTokenAndFetchUser } from "../../utils/jwtUtils.js";


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
      const user = req.user;
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
    console.log('this is req', req.user)
    const role = req.user.role.roleName;
    const departmentName = req.user.department.departmentName;
    const departmentId = req.user.department?._id;
    req.departmentFilter = {};

    if (role === "Creator" && departmentName !== "QA") {
      req.departmentFilter = {
        department: new mongoose.Types.ObjectId(departmentId),
      };
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Department access middleware error", error: error.message });
  }
};