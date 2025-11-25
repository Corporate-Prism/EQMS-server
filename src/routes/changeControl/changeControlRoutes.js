import express from "express";
import { authAndAuthorize } from "../../middlewares/authMiddleware.js";
import { upload } from "../deviation/deviationRoutes.js";
import { createChangeControl, getAllChangeControls, getChangeControlById, getChangeControlSummary } from "../../controllers/changeControl/changeControlControllers.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/changeControl:
 *   post:
 *     summary: Create a new Change Control record
 *     tags:
 *       - Change Control
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               initiatedAt:
 *                 type: string
 *                 example: "2025-11-10"
 *
 *               justification:
 *                 type: string
 *                 example: "Change required due to updated regulatory guidelines"
 *
 *               changeType1:
 *                 type: string
 *                 enum: [Major, Minor, Administrative]
 *                 example: "Major"
 *
 *               changeType2:
 *                 type: string
 *                 enum: [Permanent, Temporary]
 *                 example: "Permanent"
 *
 *               changeType3:
 *                 type: string
 *                 description: ObjectId of ChangeCategory
 *                 example: "6923fd6075a26b2cbeb84155"
 *
 *               department:
 *                 type: string
 *                 description: Department ObjectId
 *                 example: "6903176321ac1dc903fc4ec2"
 *
 *               location:
 *                 type: string
 *                 description: Location ObjectId
 *                 example: "6924012d74064bb77e762fd1"
 *
 *               item:
 *                 type: string
 *                 description: >
 *                   JSON string of item object.  
 *                   Example for equipment:  
 *                   { "type": "equipment", "equipment": "690348241bd3ba52c5846be8" }
 *                 example: "{ \"type\":\"equipment\", \"equipment\":\"690348241bd3ba52c5846be8\" }"
 *
 *               documents:
 *                 type: string
 *                 description: >
 *                   JSON array string.  
 *                   Example:  
 *                   [
 *                     { \"documentId\":\"690341011bd3ba52c58469ee\", \"documentModel\":\"Manual\" },
 *                     { \"documentId\":\"69034de51bd3ba52c5846d18\", \"documentModel\":\"Manual\" }
 *                   ]
 *                 example: "[{\"documentId\":\"690341011bd3ba52c58469ee\",\"documentModel\":\"Manual\"},{\"documentId\":\"69034de51bd3ba52c5846d18\",\"documentModel\":\"Manual\"}]"
 *
 *               similarChanges:
 *                 type: string
 *                 description: >
 *                   JSON array of ObjectIds as string.  
 *                   Example: ["id1","id2"]
 *                 example: "[\"691ebf8a88e711154892a95e\",\"691ecb3f894e6e4862a13610\"]"
 *
 *               currentSituation:
 *                 type: string
 *                 example: "Equipment malfunctioning frequently"
 *
 *               shortTitle:
 *                 type: string
 *                 example: "Change in Equipment Maintenance Procedure"
 *
 *               answer1:
 *                 type: string
 *                 example: "Proposed change is to modify maintenance frequency"
 *
 *               answer2:
 *                 type: string
 *                 example: "It is required to reduce downtime and failures"
 *
 *               impactAssessment:
 *                 type: string
 *                 example: "Low impact, no risk to product quality"
 *
 *               riskAssessment:
 *                 type: number
 *                 example: 5
 *
 *               startDate:
 *                 type: string
 *                 example: "2025-11-15"
 *
 *               endDate:
 *                 type: string
 *                 example: "2025-11-20"
 *
 *               capa:
 *                 type: string
 *                 example: "69130cd8e7a0f0bb41770d15"
 *
 *               detailedDescriptionAttachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *
 *     responses:
 *       201:
 *         description: Change Control created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
    "/",
    authAndAuthorize("Creator"),
    upload.fields([
        { name: "detailedDescriptionAttachments", maxCount: 20 },
    ]),
    createChangeControl
);

/**
 * @swagger
 * /api/v1/changeControl/:
 *   get:
 *     summary: Get all Change control records
 *     tags: [Change Control]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Change control records retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User does not have access
 *       500:
 *         description: Server error
 *
 */
router.get("/", authAndAuthorize("Creator", "Approver", "Reviewer", "System Admin"), getAllChangeControls)

/**
 * @swagger
 * /api/v1/changeControl/summary:
 *   get:
 *     summary: Get all changeControl records (summary view)
 *     tags: [Change Control]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search changeControl by short title (case-insensitive)
 *         example: "Repeated deviations observed"
 *     responses:
 *       200: 
 *         description: List of change controls retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User does not have access
 *       500:
 *         description: Server error
 */
router.get(
  "/summary",
  authAndAuthorize("System Admin", "Creator", "Reviewer", "Approver", "Approver 2"),
  getChangeControlSummary
);


/**
 * @swagger
 * /api/v1/changeControl/{id}:
 *   get:
 *     summary: Get a single change control record by ID
 *     tags: [Change Control]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The change control ID
 *     responses:
 *       200:
 *         description: change control record retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User does not have access
 *       404:
 *         description: change control not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authAndAuthorize("Creator", "Approver", "Reviewer", "System Admin", "Approver 2"), getChangeControlById)

export default router;