import express from "express";
import multer from "multer";
import { createDeviation, getDeviationById, getDeviations, getDeviationsSummary } from "../../controllers/deviation/deviationControllers.js";
import { authAndAuthorize, authMiddleware, authorizeRoles, departmentAccessMiddleware } from "../../middlewares/authMiddleware.js";

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
  authAndAuthorize("Creator"),
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
router.get("/", authAndAuthorize("System Admin", "Creator", "Reviewer", "Approver"), departmentAccessMiddleware, getDeviations)

/**
 * @swagger
 * /api/v1/deviations/summary:
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
router.get("/summary", authAndAuthorize("System Admin", "Creator", "Reviewer", "Approver"), departmentAccessMiddleware, getDeviationsSummary)

/**
 * @swagger
 * /api/v1/deviations/{id}:
 *   get:
 *     summary: Get a deviation by ID
 *     description: Retrieve a single deviation record with all populated fields by its unique ID.
 *     tags: [Deviations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the deviation to retrieve
 *         schema:
 *           type: string
 *           example: 67124f9c1234567890abcd12
 *     responses:
 *       200:
 *         description: Deviation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 deviation:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67124f9c1234567890abcd12
 *                     deviationNumber:
 *                       type: string
 *                       example: HUM-DEV001
 *                     summary:
 *                       type: string
 *                       example: Temperature excursion during tablet coating
 *                     department:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 68d54b4141971dc972750f70
 *                         departmentName:
 *                           type: string
 *                           example: Quality Control
 *                     location:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 68e764a1429791415783174e
 *                         locationName:
 *                           type: string
 *                           example: Manufacturing Area
 *                         locationCode:
 *                           type: string
 *                           example: MA-01
 *       400:
 *         description: Invalid or missing deviation ID
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User does not have access
 *       404:
 *         description: Deviation not found
 *       500:
 *         description: Server error
 */

router.get(
  "/:id",
  authAndAuthorize("System Admin", "Creator", "Reviewer", "Approver"),
  departmentAccessMiddleware,
  getDeviationById
);

export default router;
