import express from "express";
import { authAndAuthorize } from "../../middlewares/authMiddleware.js";
import { upload } from "../deviation/deviationRoutes.js";
import { createChangeControl, getAllChangeControls, getChangeControlById, getChangeControlSummary, qaReviewChangeControl, recordChangeControlHistoricalCheck, recordChangeControlTeamImpact, reviewChangeControl, submitChangeControlForReview } from "../../controllers/changeControl/changeControlControllers.js";

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
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         required: false
 *         description: page number
 *         example: "2"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         required: false
 *         description: number of doucments to show
 *         example: "10"
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

/**
 * @swagger
 * /api/v1/changeControl/{id}/submit:
 *   put:
 *     summary: Submit a change control for review
 *     tags: [Change Control]
 *     description: Change the change control status from Draft to Submitted and record who submitted it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: change control ID to submit for review
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
 *         description: change control submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: change control submitted for review successfully
 *                 deviation:
 *                   type: object
 *                   description: Updated change control details
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
 *         description: Invalid operation or change control not in Draft state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Only Draft change control can be submitted for review
 *       404:
 *         description: change control not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: change control not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error submitting change control
 */
router.put("/:id/submit", authAndAuthorize("Creator"), submitChangeControlForReview);

/**
 * @swagger
 * /api/v1/changeControl/{id}/review:
 *   put:
 *     summary: Review a change control (approve or reject)
 *     description: Allows a department head or QA reviewer to approve or reject a change control under review.
 *     tags:
 *       - Change Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: change control ID
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
 *                 example: "change control reviewed and approved."
 *     responses:
 *       200:
 *         description: change control reviewed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: change control approved successfully.
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 changeControl:
 *                   type: object
 *       400:
 *         description: Invalid request (wrong status or invalid action).
 *       403:
 *         description: Unauthorized — user cannot review this deviation.
 *       404:
 *         description: change control or reviewer not found.
 *       500:
 *         description: Server error.
 */

router.put("/:id/review", authAndAuthorize("Reviewer"), reviewChangeControl);

/**
 * @swagger
 * /api/v1/changeControl/{id}/qa-review:
 *   put:
 *     summary: QA review change control (accept or reject)
 *     tags: [Change Control]
 *     description: QA Approver reviews a change control after Department Head approval.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: change control ID
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
 *                 example: "QA has reviewed and accepted the change control."
 *     responses:
 *       200:
 *         description: change control reviewed by QA successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 changeControl:
 *                   type: object
 *       400:
 *         description: Invalid status or action
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: change control not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id/qa-review", authAndAuthorize("Approver"), qaReviewChangeControl);

/**
 * @swagger
 * /api/v1/changeControl/impact-assessment:
 *   post:
 *     summary: Record Impact Assessment by Investigation Team
 *     description: Allows members of the assigned investigation team to record their impact assessment for a change control.
 *     tags: [Change Control]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - changeControlId
 *               - answers
 *             properties:
 *               changeControlId:
 *                 type: string
 *                 description: The ID of the change control for which the team is recording the impact assessment.
 *                 example: "67204e72b62e5a001e3c5a29"
 *               answers:
 *                 type: array
 *                 description: A list of question-answer pairs for the impact assessment.
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       description: ID of the impact assessment question.
 *                       example: "67124f9c1234567890abcd12"
 *                     answer:
 *                       type: string
 *                       description: Answer provided by the team.
 *                       example: "Yes, deviation affects batch integrity."
 *                     comment:
 *                       type: string
 *                       description: Optional additional comments.
 *                       example: "Further investigation needed."
 *     responses:
 *       201:
 *         description: Team impact assessment recorded successfully.
 *       400:
 *         description: Invalid status or missing fields.
 *       403:
 *         description: User not authorized.
 *       404:
 *         description: change control or team not found.
 *       500:
 *         description: Server error.
 */
router.post("/impact-assessment", authAndAuthorize("Creator"), recordChangeControlTeamImpact);

/**
 * @swagger
 * /api/v1/changeControl/historical-check:
 *   post:
 *     summary: Record Historical Check for a change control
 *     description: Records similar past change control identified after impact assessment. Only allowed when deviation status is "Impact Assessment Done".
 *     tags: [Change Control]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - changeControlId
 *               - similarChanges
 *             properties:
 *               changeControlId:
 *                 type: string
 *                 description: ID of the current change control being updated.
 *                 example: "67204e72b62e5a001e3c5a29"
 *               similarChanges:
 *                 type: array
 *                 description: Array of similar past change controls for historical checking.
 *                 items:
 *                   type: object
 *                   properties:
 *                     change:
 *                       type: string
 *                       description: ObjectId of the related past change control.
 *                       example: "671fbb72d91b23001e3a7b21"
 *     responses:
 *       200:
 *         description: Historical check recorded successfully.
 *       400:
 *         description: Invalid status or missing required fields.
 *       404:
 *         description: Change contol not found.
 *       500:
 *         description: Server error.
 */
router.post("/historical-check", authAndAuthorize("Creator"), recordChangeControlHistoricalCheck)
export default router;