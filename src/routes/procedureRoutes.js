import express from "express";
import {
  createProcedure,
  addProcedureVersion,
  getProcedures,
  getProcedureVersionsByProcedureId,
  getProcedureVersionById,
  reviewProcedureVersion,
  approveProcedureVersion,
} from "../controllers/procedureControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Procedures
 *   description: API for managing procedures, versions, and reviews
 */

/**
 * @swagger
 * /api/v1/procedures/new:
 *   post:
 *     summary: Create a new Procedure with its first version
 *     tags: [Procedures]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - procedureName
 *               - department
 *               - deptCode
 *               - versionType
 *               - preparedBy
 *             properties:
 *               procedureName:
 *                 type: string
 *                 example: Equipment Maintenance SOP
 *               department:
 *                 type: string
 *                 description: Department ID
 *                 example: 650f8c123abc456def789012
 *               deptCode:
 *                 type: string
 *                 description: Department short code (used for reference number sequence)
 *                 example: ENG
 *               versionType:
 *                 type: string
 *                 example: Draft
 *               preparedBy:
 *                 type: string
 *                 description: User ID who prepared this version
 *                 example: 64ad22f1234abc567de890ff
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-09-20
 *               purpose:
 *                 type: string
 *               scope:
 *                 type: string
 *               procedures:
 *                 type: string
 *               abbrevations:
 *                 type: string
 *               responsibilities:
 *                 type: string
 *               metaData:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Dynamic fields (key-value pairs) that may vary
 *                 example:
 *                   riskLevel: High
 *                   reviewedByDept: QA
 *                   checklistRequired: true
 *     responses:
 *       201:
 *         description: Procedure created successfully
 *       400:
 *         description: deptCode is required
 *       500:
 *         description: Internal server error
 */
router.post("/new", createProcedure);

/**
 * @swagger
 * /api/v1/procedures/version:
 *   post:
 *     summary: Add a new version to an existing Procedure
 *     tags: [Procedures]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - procedureId
 *               - versionType
 *               - preparedBy
 *             properties:
 *               procedureId:
 *                 type: string
 *                 description: Procedure ID
 *                 example: 6510f9c123abc456def78901
 *               versionType:
 *                 type: string
 *                 example: Revision
 *               preparedBy:
 *                 type: string
 *                 description: User ID who prepared this version
 *                 example: 64ad22f1234abc567de890ff
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-10-05
 *               purpose:
 *                 type: string
 *               scope:
 *                 type: string
 *               procedures:
 *                 type: string
 *               abbrevations:
 *                 type: string
 *               responsibilities:
 *                 type: string
 *               metaData:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Dynamic fields (key-value pairs) that may vary
 *                 example:
 *                   inspectionInterval: Monthly
 *                   reviewer: John Doe
 *                   versionNotes: Updated checklist
 *     responses:
 *       201:
 *         description: Procedure version added successfully
 *       400:
 *         description: Procedure ID is required
 *       404:
 *         description: Procedure not found
 *       500:
 *         description: Internal server error
 */
router.post("/version", addProcedureVersion);

/**
 * @swagger
 * /api/v1/procedures:
 *   get:
 *     summary: Get all procedures with their versions
 *     tags: [Procedures]
 *     responses:
 *       200:
 *         description: List of procedures
 *       500:
 *         description: Internal server error
 */
router.get("/", getProcedures);

/**
 * @swagger
 * /api/v1/procedures/{id}/versions:
 *   get:
 *     summary: Get all versions for a specific procedure
 *     tags: [Procedures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Procedure ID
 *     responses:
 *       200:
 *         description: Versions fetched successfully
 *       404:
 *         description: Procedure not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id/versions", getProcedureVersionsByProcedureId);

/**
 * @swagger
 * /api/v1/procedures/version/{id}:
 *   get:
 *     summary: Get a specific procedure version by ID
 *     tags: [Procedures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Procedure Version ID
 *     responses:
 *       200:
 *         description: Procedure version fetched successfully
 *       404:
 *         description: Procedure version not found
 *       500:
 *         description: Internal server error
 */
router.get("/version/:id", getProcedureVersionById);

/**
 * @swagger
 * /api/v1/procedures/version/review:
 *   post:
 *     summary: Review a procedure version
 *     tags: [Procedures]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - versionId
 *               - reviewedBy
 *               - comments
 *             properties:
 *               versionId:
 *                 type: string
 *               reviewedBy:
 *                 type: string
 *                 description: User ID of reviewer
 *               comments:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [under_review, approved, rejected]
 *               nextReviewDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Review saved successfully
 *       404:
 *         description: Procedure version not found
 *       500:
 *         description: Internal server error
 */
router.post("/version/review", reviewProcedureVersion);

/**
 * @swagger
 * /api/v1/procedures/version/approve:
 *   post:
 *     summary: Approve a procedure version
 *     tags: [Procedures]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - versionId
 *               - approvedBy
 *             properties:
 *               versionId:
 *                 type: string
 *               approvedBy:
 *                 type: string
 *                 description: User ID of approver
 *     responses:
 *       200:
 *         description: Procedure version approved successfully
 *       404:
 *         description: Procedure version not found
 *       500:
 *         description: Internal server error
 */
router.post("/version/approve", approveProcedureVersion);

export default router;
