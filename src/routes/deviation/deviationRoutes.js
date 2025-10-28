import express from "express";
import multer from "multer";
import { createDeviation, getDeviations } from "../../controllers/deviation/deviationControllers.js";
import { authMiddleware, authorizeRoles } from "../../middlewares/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/create",
  upload.fields([
    { name: "detailedDescriptionAttachments", maxCount: 10 },
    { name: "relatedRecordsAttachments", maxCount: 10 },
  ]),
  createDeviation
);

/**
 * @swagger
 * tags:
 *   name: Deviations
 *   description: API endpoints for managing deviations
 */

/**
 * @swagger
 * /api/v1/deviations/:
 *   get:
 *     summary: get all deviations
 *     tags: [Deviations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: 
 *         description: List of deviations retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User does not have access
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, authorizeRoles("System Admin"), getDeviations)

export default router;
