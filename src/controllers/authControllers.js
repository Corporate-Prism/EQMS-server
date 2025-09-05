import Auth from "../models/Auth.js";
import { hashPassword, verifyPassword } from "../../utils/bcrypt.js";
import { generateToken } from "../../utils/jwtUtils.js";

export const signup = async (req, res) => {
  try {
    const { email, password, name, role, department } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new Auth({
      email,
      password: hashedPassword,
      name,
      role,
      department,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActivate) {
      return res.status(403).json({
        message:
          "You are on the cooling period by now, please try again later.",
      });
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user._id, role: user.role });

    return res
      .status(200)
      .json({ success: true, message: "Login successful", user, token });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }

    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Auth.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActivate = !user.isActivate;
    await user.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "User activation status updated successfully",
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal server error",
      });
  }
};
