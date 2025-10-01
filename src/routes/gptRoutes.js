import express from "express";
import { generatePolicyData } from "../controllers/gptController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: GPT
 *   description: Endpoints for AI-powered policy data generation
 */

/**
 * @swagger
 * /api/v1/gpt/policy/generate:
 *   post:
 *     summary: Generate policy data using AI
 *     tags: [GPT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               policyName:
 *                 type: string
 *                 description: Name of the policy
 *               field:
 *                 type: string
 *                 description: The specific field to generate (e.g., "objective", "scope")
 *             required:
 *               - policyName
 *               - field
 *             example:
 *               policyName: "Information Security Policy"
 *               field: "objective"
 *     responses:
 *       200:
 *         description: Successfully generated policy data
 *       404:
 *         description: Model not found or could not be loaded
 *       500:
 *         description: Internal server error
 */
router.post("/policy/generate", generatePolicyData);

export default router;
