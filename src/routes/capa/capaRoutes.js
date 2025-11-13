import express from "express";
import { createCAPA, getAllCAPA, getCAPAById, getCAPASummary, qaReviewCapa, reviewCapa, submitCapaForReview } from "../../controllers/capa/capaControllers.js";
import { authAndAuthorize } from "../../middlewares/authMiddleware.js";
import { upload } from "../deviation/deviationRoutes.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CAPA
 *   description: API endpoints for managing capa
 */

/**
 * @swagger
 * /api/v1/capa/:
 *   post:
 *     summary: Create a new CAPA record
 *     tags: [CAPA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               initiationDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-12"
 *               targetClosureDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-12"
 *               reasonForCAPA:
 *                 type: string
 *                 example: "Repeated deviations observed in production process"
 *               department:
 *                 type: string
 *                 example: "674fc8a4b2a41ccead109f21"
 *               immediateCorrectionTaken:
 *                 type: string
 *                 example: "Immediate cleaning and retraining conducted"
 *               investigationAndRootCause:
 *                 type: string
 *                 example: "Human error due to lack of SOP awareness"
 *               correctiveActions:
 *                 type: string
 *                 example: "Conduct retraining and revise SOP"
 *               preventiveActions:
 *                 type: string
 *                 example: "Introduce refresher training every 6 months"
 *               deviation:
 *                 type: string
 *                 example: "674fc8a4b2a41ccead109f11"
 *               relatedRecord:
 *                 type: string
 *                 example: "674fc8a4b2a41ccead109f21"
 * 
 *               supportingDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: CAPA created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User does not have permission
 *       404:
 *         description: Deviation not found
 *       500:
 *         description: Server error
 */
router.post(
    "/",
    authAndAuthorize("Creator"),
    upload.fields([
        { name: "relatedRecordsAttachments", maxCount: 10 },
        { name: "supportingDocuments", maxCount: 10 },
    ]),
    createCAPA
);

/**
 * @swagger
 * /api/v1/capa/:
 *   get:
 *     summary: Get all CAPA records
 *     tags: [CAPA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of CAPA records retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User does not have access
 *       500:
 *         description: Server error
 *
 */
router.get("/", authAndAuthorize("Creator", "Approver", "Reviewer", "System Admin"), getAllCAPA)

/**
 * @swagger
 * /api/v1/capa/summary:
 *   get:
 *     summary: Get all CAPA records (summary view)
 *     tags: [CAPA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search CAPAs by reasonForCAPA (case-insensitive)
 *         example: "Repeated deviations observed"
 *     responses:
 *       200: 
 *         description: List of CAPAs retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User does not have access
 *       500:
 *         description: Server error
 */
router.get(
    "/summary",
    authAndAuthorize("System Admin", "Creator", "Reviewer", "Approver"),
    getCAPASummary
);

/**
 * @swagger
 * /api/v1/capa/{id}:
 *   get:
 *     summary: Get a single CAPA record by ID
 *     tags: [CAPA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The CAPA ID
 *     responses:
 *       200:
 *         description: CAPA record retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User does not have access
 *       404:
 *         description: CAPA not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authAndAuthorize("Creator", "Approver", "Reviewer", "System Admin"), getCAPAById)

/**
 * @swagger
 * /api/v1/capa/{id}/submit:
 *   put:
 *     summary: Submit a capa for review
 *     tags: [CAPA]
 *     description: Change the capa status from Draft to Submitted and record who submitted it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: capa ID to submit for review
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
 *         description: capa submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: capa submitted for review successfully
 *                 deviation:
 *                   type: object
 *                   description: Updated capa details
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
 *         description: Invalid operation or capa not in Draft state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Only Draft capa can be submitted for review
 *       404:
 *         description: capa not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: capa not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error submitting capa
 */
router.put("/:id/submit", authAndAuthorize("Creator"), submitCapaForReview);

/**
 * @swagger
 * /api/v1/capa/{id}/review:
 *   put:
 *     summary: Review a capa (approve or reject)
 *     description: Allows a department head or QA reviewer to approve or reject a deviation under review.
 *     tags:
 *       - CAPA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: capa ID
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
 *                 example: "capa reviewed and approved."
 *     responses:
 *       200:
 *         description: capa reviewed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: capa approved successfully.
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 capa:
 *                   type: object
 *       400:
 *         description: Invalid request (wrong status or invalid action).
 *       403:
 *         description: Unauthorized — user cannot review this deviation.
 *       404:
 *         description: capa or reviewer not found.
 *       500:
 *         description: Server error.
 */

router.put("/:id/review", authAndAuthorize("Reviewer"), reviewCapa);

/**
 * @swagger
 * /api/v1/capa/{id}/qa-review:
 *   put:
 *     summary: QA review capa (accept or reject)
 *     tags: [CAPA]
 *     description: QA Approver reviews a capa after Department Head approval.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: capa ID
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
 *                 example: "QA has reviewed and accepted the capa."
 *     responses:
 *       200:
 *         description: capa reviewed by QA successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 capa:
 *                   type: object
 *       400:
 *         description: Invalid status or action
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: capa not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id/qa-review", authAndAuthorize("Approver"), qaReviewCapa);

export default router;