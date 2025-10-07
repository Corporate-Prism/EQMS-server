import express from "express";
import {
  createWI,
  addWIVersion,
  getWIs,
  getWIVersionsByWIId,
  getWIVersionById,
  reviewWIVersion,
  approveWIVersion,
  getWIsByDepartmentId,
} from "../controllers/WIControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: WorkInstructions
 *   description: API for managing Work Instructions (WI), their versions, and reviews
 */

/**
 * @swagger
 * /api/v1/work-instructions/new:
 *   post:
 *     summary: Create a new Work Instruction with its first version
 *     tags: [WorkInstructions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workInstructionName
 *               - department
 *               - deptCode
 *               - versionType
 *               - preparedBy
 *             properties:
 *               workInstructionName:
 *                 type: string
 *                 example: Machine Safety WI
 *               department:
 *                 type: string
 *                 description: Department ID
 *                 example: 650f8c123abc456def789012
 *               deptCode:
 *                 type: string
 *                 description: Department short code (used for reference number sequence)
 *                 example: QA
 *               versionType:
 *                 type: string
 *                 example: major
 *               preparedBy:
 *                 type: string
 *                 description: User ID who prepared this version
 *                 example: 64ad22f1234abc567de890ff
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-09-15
 *               purpose:
 *                 type: string
 *               scope:
 *                 type: string
 *               instructions:
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
 *                   safetyLevel: High
 *                   requiresPPE: true
 *                   machineType: CNC
 *     responses:
 *       201:
 *         description: Work Instruction created successfully
 *       400:
 *         description: deptCode is required
 *       500:
 *         description: Internal server error
 */
router.post("/new", createWI);

/**
 * @swagger
 * /api/v1/work-instructions/version:
 *   post:
 *     summary: Add a new version to an existing Work Instruction
 *     tags: [WorkInstructions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - WIid
 *               - versionType
 *               - preparedBy
 *             properties:
 *               WIid:
 *                 type: string
 *                 description: Work Instruction ID
 *                 example: 6510f9c123abc456def78901
 *               versionType:
 *                 type: string
 *                 example: minor
 *               preparedBy:
 *                 type: string
 *                 description: User ID who prepared this version
 *                 example: 64ad22f1234abc567de890ff
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-10-01
 *               purpose:
 *                 type: string
 *               scope:
 *                 type: string
 *               instructions:
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
 *                   inspector: John Doe
 *                   revisionReason: Updated safety protocols
 *     responses:
 *       201:
 *         description: Work Instruction version added successfully
 *       400:
 *         description: Work Instruction ID is required
 *       404:
 *         description: Work Instruction not found
 *       500:
 *         description: Internal server error
 */
router.post("/version", addWIVersion);

/**
 * @swagger
 * /api/v1/work-instructions:
 *   get:
 *     summary: Get all Work Instructions with their versions
 *     tags: [WorkInstructions]
 *     responses:
 *       200:
 *         description: List of WIs
 *       500:
 *         description: Internal server error
 */
router.get("/", getWIs);

/**
 * @swagger
 * /api/v1/work-instructions/department/{departmentId}:
 *   get:
 *     summary: Get work instructions by department ID
 *     tags: [WorkInstructions]
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         description: ID of the department
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Work instructions retrieved successfully
 *       404:
 *         description: No work instructions found for the given department
 *       500:
 *         description: Internal server error
 */
router.get("/department/:departmentId", getWIsByDepartmentId);

/**
 * @swagger
 * /api/v1/work-instructions/{id}:
 *   get:
 *     summary: Get all versions for a specific Work Instruction
 *     tags: [WorkInstructions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Instruction ID
 *     responses:
 *       200:
 *         description: Versions fetched successfully
 *       404:
 *         description: WI not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getWIVersionsByWIId);

/**
 * @swagger
 * /api/v1/work-instructions/version/{id}:
 *   get:
 *     summary: Get a specific Work Instruction version by ID
 *     tags: [WorkInstructions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Instruction Version ID
 *     responses:
 *       200:
 *         description: Work Instruction version fetched successfully
 *       404:
 *         description: Work Instruction version not found
 *       500:
 *         description: Internal server error
 */
router.get("/version/:id", getWIVersionById);

/**
 * @swagger
 * /api/v1/work-instructions/version/review:
 *   post:
 *     summary: Review a Work Instruction version
 *     tags: [WorkInstructions]
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
 *               comments:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [under_review, approved, rejected]
 *               nextReviewDate:
 *                 type: string
 *                 format: date
 */
router.post("/version/review", reviewWIVersion);

/**
 * @swagger
 * /api/v1/work-instructions/version/approve:
 *   post:
 *     summary: Approve a Work Instruction version
 *     tags: [WorkInstructions]
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
 */
router.post("/version/approve", approveWIVersion);

export default router;
