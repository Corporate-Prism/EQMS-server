import express from "express";
import multer from "multer";
import { createDeviation, getDeviationById, getDeviations, getDeviationsSummary, reviewDeviation, submitDeviationForReview } from "../../controllers/deviation/deviationControllers.js";
import { authAndAuthorize, authMiddleware, departmentAccessMiddleware } from "../../middlewares/authMiddleware.js";

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

/**
 * @swagger
 * /api/v1/deviations/{id}/review:
 *   patch:
 *     summary: Review a deviation (Department Head review)
 *     description: Allows a reviewer (Department Head) from the same department as the deviation creator to review, approve, or return a deviation for revision.
 *     tags: [Deviations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Deviation ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, return]
 *                 description: Action to take on the deviation.
 *                 example: approve
 *               reviewComments:
 *                 type: string
 *                 description: Optional comments by the reviewer.
 *                 example: Deviation verified and approved for QA review.
 *     responses:
 *       200:
 *         description: Deviation reviewed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Deviation approved successfully.
 *                 deviation:
 *                   $ref: '#/components/schemas/Deviation'
 *       400:
 *         description: Invalid input or unauthorized action.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Only reviewers from the same department can review this deviation.
 *       401:
 *         description: Unauthorized - Missing or invalid token.
 *       404:
 *         description: Deviation not found.
 *       500:
 *         description: Internal server error.
 */
router.patch("/:id/review", authMiddleware, reviewDeviation);

/**
 * @swagger
 * /api/v1/deviations/{id}/submit:
 *   put:
 *     summary: Submit a deviation for review
 *     tags: [Deviations]
 *     description: Change the deviation status from Draft to Submitted and record who submitted it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Deviation ID to submit for review
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *                 description: Optional comments added during submission
 *     responses:
 *       200:
 *         description: Deviation submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deviation submitted for review successfully
 *                 deviation:
 *                   type: object
 *                   description: Updated deviation details
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 652c8e3f9e62c77b0a4b1221
 *                     title:
 *                       type: string
 *                       example: Temperature deviation in Room 104
 *                     status:
 *                       type: string
 *                       example: Submitted
 *                     submittedBy:
 *                       type: string
 *                       example: 652c8e3f9e62c77b0a4b1229
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-31T12:45:23.000Z
 *       400:
 *         description: Invalid operation or deviation not in Draft state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Only Draft deviations can be submitted for review
 *       404:
 *         description: Deviation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deviation not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error submitting deviation
 */
router.put("/:id/submit", authAndAuthorize("Creator"), submitDeviationForReview);

export default router;
