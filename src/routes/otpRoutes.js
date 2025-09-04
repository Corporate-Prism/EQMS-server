import express from "express";
import { generateOTP, verifyOTP } from "../controllers/otpControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: OTP
 *     description: OTP management routes
 */

/**
 * @swagger
 * paths:
 *   /api/v1/otp/generate-otp:
 *     post:
 *       summary: Generate OTP
 *       tags: [OTP]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: user@example.com
 *                 action:
 *                   type: string
 *                   example: "register or reset"
 *       responses:
 *         200:
 *           description: OTP generated successfully
 *         500:
 *           description: Internal server error
 */
router.post("/generate-otp", generateOTP);

/**
 * @swagger
 * paths:
 *   /api/v1/otp/verify-otp:
 *     post:
 *       summary: Verify OTP
 *       tags: [OTP]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: user@example.com
 *                 otp:
 *                   type: string
 *                   example: "123456"
 *       responses:
 *         200:
 *           description: OTP verified successfully
 *         500:
 *           description: Internal server error
 */
router.post("/verify-otp", verifyOTP);

export default router;
