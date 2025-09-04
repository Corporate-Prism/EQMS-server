import nodemailer from "nodemailer";
import Auth from "../models/Auth.js";
import dotenv from "dotenv";
import dns from "dns";

// Force IPv4 to avoid IPv6 timeouts
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

let verificationCodes = {}; // Store verification codes temporarily

export const generateOTP = async (req, res) => {
  const { email, action } = req.body;

  if (!email || !action) {
    return res.status(400).json({ message: "Email and action are required." });
  }

  const user = await Auth.findOne({ where: { email } });

  if (action === "register" && user) {
    return res.status(400).json({ message: "User already exists" });
  }

  if (action === "reset" && !user) {
    return res.status(404).json({ message: "User not found" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationTime = Date.now() + 5 * 60 * 1000;

  verificationCodes[email] = { code, expiresAt: expirationTime };

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // const transporter = nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  //   port: 587, // ✅ Recommended port
  //   secure: false, // ✅ STARTTLS instead of SSL
  //   auth: {
  //     user: process.env.AUTH_EMAIL,
  //     pass: process.env.AUTH_PASSWORD, // ✅ Use app password, not normal password
  //   },
  //   tls: {
  //     rejectUnauthorized: false, // Avoid certificate issues
  //   },
  //   connectionTimeout: 20000, // 20 seconds timeout
  // });

  const subject =
    action === "reset" ? "Password reset OTP" : "OTP for registration";

  const text = `Dear user,\n\nYour One Time Password (OTP) has been generated upon request to ${
    action === "reset" ? "reset password" : "register"
  } in QMS. Your verification code is: ${code}, that can be used only once and is valid for the next 5 minutes.\n\nFor your own security, please do not share this OTP with anyone.\n\nThank you,\nTeam QMS`;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Verification code sent." });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
};

// export const generateOTP = async (req, res) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com", // Use explicit host instead of service
//       port: 587, // Use port 587 with STARTTLS
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: process.env.AUTH_EMAIL,
//         pass: process.env.AUTH_PASSWORD,
//       },
//       tls: {
//         rejectUnauthorized: false, // Add this if you're having SSL issues
//       },
//     });

//     return true;
//   } catch (error) {
//     console.error("Error verifying transporter:", error);
//     return false;
//   }
// };

export const verifyOTP = async (req, res) => {
  const { email, code } = req.body;

  // Check if OTP code is provided
  if (!code) {
    return res.status(400).json({
      success: false,
      message: "OTP code is required.",
    });
  }

  // Check if OTP exists
  if (!verificationCodes[email]) {
    return res.status(400).json({
      success: false,
      message: "OTP not found. Please request a new one.",
      action: "resend",
    });
  }

  const { code: storedCode, expiresAt } = verificationCodes[email];

  // Check if OTP is expired
  if (Date.now() > expiresAt) {
    delete verificationCodes[email]; // Remove expired OTP
    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new one.",
      action: "resend",
    });
  }

  // Check if OTP is correct
  if (storedCode !== code) {
    return res.status(400).json({
      success: false,
      message: "Invalid verification code.",
    });
  }

  // OTP is correct - proceed with login
  delete verificationCodes[email]; // Remove OTP after successful verification
  return res.json({ success: true, message: "OTP verified!" });
};
