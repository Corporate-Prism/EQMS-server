import express from "express";
import multer from "multer";
import { createDeviation, getDeviationById, getDeviations, getDeviationsSummary, qaReviewDeviation, recordCapaDecision, reviewDeviation, submitDeviationForReview } from "../../controllers/deviation/deviationControllers.js";
import { authAndAuthorize } from "../../middlewares/authMiddleware.js";

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
router.get("/", authAndAuthorize("System Admin", "Creator", "Reviewer", "Approver"), getDeviations)

/**
 * @swagger
 * /api/v1/deviations/summary:
 *   get:
 *     summary: get all deviations
 *     tags: [Deviations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search deviations by summary (case-insensitive)
 *         example: "temperature deviation"
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
router.get("/summary", authAndAuthorize("System Admin", "Creator", "Reviewer", "Approver"), getDeviationsSummary)

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
  getDeviationById
);

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

/**
 * @swagger
 * /api/v1/deviations/{id}/review:
 *   put:
 *     summary: Review a deviation (approve or reject)
 *     description: Allows a department head or QA reviewer to approve or reject a deviation under review.
 *     tags:
 *       - Deviations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 enum: [Approved, Rejected]
 *                 example: Approved
 *               reviewComments:
 *                 type: string
 *                 example: "Deviation reviewed and approved."
 *     responses:
 *       200:
 *         description: Deviation reviewed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deviation approved successfully.
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 deviation:
 *                   type: object
 *       400:
 *         description: Invalid request (wrong status or invalid action).
 *       403:
 *         description: Unauthorized — user cannot review this deviation.
 *       404:
 *         description: Deviation or reviewer not found.
 *       500:
 *         description: Server error.
 */

router.put("/:id/review", authAndAuthorize("Reviewer"), reviewDeviation);

/**
 * @swagger
 * /api/v1/deviations/{id}/qa-review:
 *   put:
 *     summary: QA review deviation (accept or reject)
 *     tags: [Deviations]
 *     description: QA Approver reviews a deviation after Department Head approval.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 enum: [Approved, Rejected]
 *                 example: Approved
 *               qaComments:
 *                 type: string
 *                 example: "QA has reviewed and accepted the deviation."
 *     responses:
 *       200:
 *         description: Deviation reviewed by QA successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deviation:
 *                   type: object
 *       400:
 *         description: Invalid status or action
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Deviation not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id/qa-review", authAndAuthorize("Approver"), qaReviewDeviation);

/**
 * @swagger
 * /api/v1/deviations/record-capa-decision:
 *   post:
 *     summary: Record CAPA decision for a deviation
 *     description: |
 *       Records the CAPA decision for a given deviation.  
 *       - If CAPA is **not required**, a justification and immediate actions are recorded.  
 *       - If CAPA is **required**, a CAPA record is created and linked to the deviation.
 *     tags:
 *       - Deviations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviationId
 *               - capaRequired
 *             properties:
 *               deviationId:
 *                 type: string
 *                 description: ID of the deviation
 *                 example: "671f8761f234a3b12c9fbd45"
 *               capaRequired:
 *                 type: boolean
 *                 description: Whether CAPA is required for this deviation
 *                 example: false
 *               justification:
 *                 type: string
 *                 description: Justification for not requiring CAPA (required if capaRequired = false)
 *                 example: "Issue resolved with procedural correction, no further action needed."
 *               immediateActions:
 *                 type: array
 *                 description: List of immediate corrective/preventive actions (only if CAPA not required)
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Clean and sanitize affected area."
 *                     assignedTo:
 *                       type: string
 *                       example: "671f8761f234a3b12c9fbd45"
 *                     status:
 *                       type: string
 *                       example: pending
 *     responses:
 *       201:
 *         description: CAPA decision recorded successfully
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
 *                   example: "CAPA created and linked to deviation successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "67202f25f2452a6e09cd3a12"
 *                     deviation:
 *                       type: string
 *                       example: "671f8761f234a3b12c9fbd45"
 *                     createdBy:
 *                       type: string
 *                       example: "671d5fe3b8d71e77af9b3c42"
 *       400:
 *         description: Bad Request (Missing or invalid fields)
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
 *                   example: "Justification is required when CAPA is not required."
 *       404:
 *         description: Deviation not found
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
 *                   example: "Deviation not found."
 *       500:
 *         description: Internal server error
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
 *                   example: "Error recording CAPA decision: Something went wrong."
 */

router.post("/record-capa-decision", authAndAuthorize("Creator"), recordCapaDecision);

export default router;