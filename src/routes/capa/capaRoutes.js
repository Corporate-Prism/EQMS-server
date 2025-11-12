import express from "express";
import { createCAPA, getAllCAPA } from "../../controllers/capa/capaControllers.js";
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


export default router;