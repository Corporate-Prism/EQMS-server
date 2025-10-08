import express from "express";
import {
  createManual,
  addManualVersion,
  getManuals,
  getManualVersionsByManualId,
  reviewManualVersion,
  approveManualVersion,
  getManualVersionById,
  getManualsByDepartmentId,
} from "../../controllers/document/manualControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Manuals
 *   description: API endpoints for managing manuals, versions, reviews, and approvals
 */

/**
 * @swagger
 * /api/v1/manuals/new:
 *   post:
 *     summary: Create a new manual with its first version
 *     tags: [Manuals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - manualName
 *               - department
 *               - deptCode
 *               - versionType
 *               - introduction
 *               - objective
 *               - purpose
 *               - scope
 *               - policyStatement
 *               - organizationalStructure
 *               - effectiveDate
 *               - preparedBy
 *             properties:
 *               manualName:
 *                 type: string
 *                 example: Quality Management Manual
 *               department:
 *                 type: string
 *                 description: Department ID
 *                 example: 650f0d8f9a1b2c3d4e5f6789
 *               deptCode:
 *                 type: string
 *                 description: Code of the department used for reference number generation
 *                 example: QA
 *               versionType:
 *                 type: string
 *                 enum: [minor, major]
 *                 example: major
 *               introduction:
 *                 type: string
 *               objective:
 *                 type: string
 *               purpose:
 *                 type: string
 *               scope:
 *                 type: string
 *               policyStatement:
 *                 type: string
 *               organizationalStructure:
 *                 type: string
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-09-15
 *               preparedBy:
 *                 type: string
 *                 description: User ID
 *                 example: 651a2d3b8c1f2d4e5f6789ab
 *     responses:
 *       201:
 *         description: Manual created successfully
 *       500:
 *         description: Server error
 */
router.post("/new", createManual);

/**
 * @swagger
 * /api/v1/manuals/version:
 *   post:
 *     summary: Add a new version to an existing manual
 *     tags: [Manuals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - manualId
 *               - versionType
 *               - introduction
 *               - objective
 *               - purpose
 *               - scope
 *               - policyStatement
 *               - organizationalStructure
 *               - effectiveDate
 *               - preparedBy
 *             properties:
 *               manualId:
 *                 type: string
 *               versionType:
 *                 type: string
 *                 enum: [minor, major]
 *               introduction:
 *                 type: string
 *               objective:
 *                 type: string
 *               purpose:
 *                 type: string
 *               scope:
 *                 type: string
 *               policyStatement:
 *                 type: string
 *               organizationalStructure:
 *                 type: string
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *               preparedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: New version created successfully
 *       404:
 *         description: Manual not found
 *       500:
 *         description: Server error
 */
router.post("/version", addManualVersion);

/**
 * @swagger
 * /api/v1/manuals:
 *   get:
 *     summary: Get all manuals with their versions
 *     tags: [Manuals]
 *     responses:
 *       200:
 *         description: List of manuals
 *       500:
 *         description: Server error
 */
router.get("/", getManuals);

/**
 * @swagger
 * /api/v1/manuals/department/{departmentId}:
 *   get:
 *     summary: Get manuals by department ID
 *     tags: [Manuals]
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         description: ID of the department
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manuals retrieved successfully
 *       404:
 *         description: No manuals found for the given department
 *       500:
 *         description: Internal server error
 */
router.get("/department/:departmentId", getManualsByDepartmentId);

/**
 * @swagger
 * /api/v1/manuals/{id}:
 *   get:
 *     summary: Get a manual by ID with its versions
 *     tags: [Manuals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Manual ID
 *     responses:
 *       200:
 *         description: Manual details
 *       404:
 *         description: Manual not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getManualVersionsByManualId);

/**
 * @swagger
 * /api/v1/manuals/version/{id}:
 *   get:
 *     summary: Get a manual version by ID (with reviews, preparedBy, approvedBy populated)
 *     tags: [Manuals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ManualVersion ID
 *     responses:
 *       200:
 *         description: Manual version details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68c2a0c57a438b2a6250fe11
 *                     versionNumber:
 *                       type: string
 *                       example: "1.1"
 *                     versionType:
 *                       type: string
 *                       enum: [minor, major]
 *                       example: "minor"
 *                     introduction:
 *                       type: string
 *                     objective:
 *                       type: string
 *                     purpose:
 *                       type: string
 *                     scope:
 *                       type: string
 *                     policyStatement:
 *                       type: string
 *                     organizationalStructure:
 *                       type: string
 *                     effectiveDate:
 *                       type: string
 *                       format: date
 *                       example: 2025-09-15
 *                     preparedBy:
 *                       type: object
 *                       description: User who prepared the version
 *                     approvedBy:
 *                       type: object
 *                       description: User who approved the version
 *                     reviews:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           reviewedBy:
 *                             type: object
 *                             description: User who reviewed
 *                           comments:
 *                             type: string
 *                             example: "Looks good, ready for approval."
 *       404:
 *         description: Manual version not found
 *       500:
 *         description: Server error
 */
router.get("/version/:id", getManualVersionById);

/**
 * @swagger
 * /api/v1/manuals/review:
 *   post:
 *     summary: Add a review to a manual version
 *     tags: [Manuals]
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
 *                 enum: [draft, under_review, approved]
 *               nextReviewDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Review added successfully
 *       404:
 *         description: Manual version not found
 *       500:
 *         description: Server error
 */
router.post("/review", reviewManualVersion);

/**
 * @swagger
 * /api/v1/manuals/approve:
 *   post:
 *     summary: Approve a manual version
 *     tags: [Manuals]
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
 *                 example: 68c2a0c57a438b2a6250fe11
 *               approvedBy:
 *                 type: string
 *                 example: 68b000c139451ac7e97cdbf3
 *     responses:
 *       200:
 *         description: Manual version approved successfully
 *       404:
 *         description: Manual version not found
 *       500:
 *         description: Server error
 */
router.post("/approve", approveManualVersion);

export default router;
