import express from "express";
import {
  signup,
  login,
  resetPassword,
  activateUser,
} from "../controllers/authControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication routes management
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Create new User
 *     tags: [Auth]
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 required: true
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 required: true
 *                 example: John@123
 *               role:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/signup", signup);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     description: Login an existing user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 required: true
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 required: true
 *                 example: John@123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   put:
 *     summary: Reset Password
 *     tags: [Auth]
 *     description: Reset the password for an existing user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 required: true
 *                 example: john.doe@example.com
 *               newPassword:
 *                 type: string
 *                 required: true
 *                 example: NewJohn@123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put("/reset-password", resetPassword);

/**
 * @swagger
 * path:
 *   /api/v1/auth/activate-user/{userId}:
 *     put:
 *       summary: Activate or deactivate a user
 *       tags: [Auth]
 *       description: Toggle the activation status of a user
 *       parameters:
 *         - in: path
 *           name: userId
 *           required: true
 *           description: ID of the user to activate or deactivate
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: User activation status updated successfully
 *         404:
 *           description: User not found
 *         500:
 *           description: Internal server error
 */
router.put("/activate-user/:userId", activateUser);

export default router;
