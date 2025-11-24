import express from "express";
import { authAndAuthorize } from "../../middlewares/authMiddleware.js";
import { upload } from "../deviation/deviationRoutes.js";
import { createChangeControl } from "../../controllers/changeControl/changeControlControllers.js";

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
 *                 format: date
 *                 example: "2025-11-10"

 *               justification:
 *                 type: string
 *                 example: "Change required due to updated regulatory guidelines"

 *               changeType1:
 *                 type: string
 *                 enum: [Major, Minor, Administrative]
 *                 example: "Major"

 *               changeType2:
 *                 type: string
 *                 enum: [Permanent, Temporary]
 *                 example: "Permanent"

 *               changeType3:
 *                 type: string
 *                 description: "ObjectId of ChangeCategory"
 *                 example: "674fc8a4b2a41ccead109aaa"

 *               department:
 *                 type: string
 *                 description: "Department ObjectId"
 *                 example: "674fc8a4b2a41ccead109f21"

 *               location:
 *                 type: string
 *                 description: "Location ObjectId"
 *                 example: "674fc8a4b2a41ccead109f21"

 *               # ----------------------------
 *               # ITEM (Now proper object)
 *               # ----------------------------
 *               item:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [product, material, equipment]
 *                   productName:
 *                     type: string
 *                   productCode:
 *                     type: string
 *                   productBatchNumber:
 *                     type: string
 *                   materialName:
 *                     type: string
 *                   materialCode:
 *                     type: string
 *                   materialBatchNumber:
 *                     type: string
 *                   equipment:
 *                     type: string
 *                     description: "Equipment ObjectId"
 *                 required:
 *                   - type
 *                 example:
 *                   type: "product"
 *                   productName: "Amoxicillin 250mg"
 *                   productCode: "AMX-250"
 *                   productBatchNumber: "BATCH-001"

 *               # ----------------------------
 *               # DOCUMENTS (Now proper array)
 *               # ----------------------------
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     documentId:
 *                       type: string
 *                     documentModel:
 *                       type: string
 *                       enum: [Manual, Policy, Procedure, WorkInstruction]
 *                 example:
 *                   - documentId: "674fc8a4b2a41ccead109aaa"
 *                     documentModel: "Manual"

 *               # ----------------------------
 *               # SIMILAR CHANGES (Array)
 *               # ----------------------------
 *               similarChanges:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "674fc8a4b2a41ccead109bbb"
 *                   - "674fc8a4b2a41ccead109ccc"

 *               currentSituation:
 *                 type: string
 *                 example: "Equipment malfunctioning frequently"

 *               shortTitle:
 *                 type: string
 *                 example: "Change in Equipment Maintenance Procedure"

 *               answer1:
 *                 type: string
 *                 example: "Proposed change is to modify maintenance frequency"

 *               answer2:
 *                 type: string
 *                 example: "It is required to reduce downtime and failures"

 *               impactAssessment:
 *                 type: string
 *                 example: "Low impact, no risk to product quality"

 *               riskAssessment:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 5

 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-15"

 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-01"

 *               capa:
 *                 type: string
 *                 description: "CAPA ObjectId"
 *                 example: "674fc8a4b2a41ccead10capa"

 *               # ----------------------------
 *               # FILE UPLOADS
 *               # ----------------------------
 *               detailedDescriptionAttachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary

 *     responses:
 *       201:
 *         description: Change Control created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

router.post(
  "/",
  authAndAuthorize("Creator"),
  upload.fields([{ name: "detailedDescriptionAttachments", maxCount: 20 }]),
  createChangeControl
);

export default router;
