import express from "express";
import {
  createPolicy,
  addPolicyVersion,
  getPolicies,
  getPolicyVersionsByPolicyId,
  getPolicyVersionById,
  reviewPolicyVersion,
  approvePolicyVersion,
  getPoliciesByDepartmentId,
} from "../controllers/policyControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Policies
 *   description: API endpoints for managing policies and their versions
 */

/**
 * @swagger
 * /api/v1/policies/new:
 *   post:
 *     summary: Create a new Policy with its first version
 *     tags: [Policies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policyName
 *               - department
 *               - deptCode
 *               - versionType
 *               - preparedBy
 *               - effectiveDate
 *               - objective
 *               - scope
 *               - policies
 *             properties:
 *               policyName:
 *                 type: string
 *                 example: Data Protection Policy
 *               department:
 *                 type: string
 *                 description: Department ID
 *                 example: 650f0d8f9a1b2c3d4e5f6789
 *               deptCode:
 *                 type: string
 *                 description: Department code used for reference number generation
 *                 example: HR
 *               versionType:
 *                 type: string
 *                 enum: [minor, major]
 *                 example: major
 *               preparedBy:
 *                 type: string
 *                 description: User ID
 *                 example: 651a2d3b8c1f2d4e5f6789ab
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-09-15
 *               objective:
 *                 type: string
 *               scope:
 *                 type: string
 *               policies:
 *                 type: string
 *               abbrevations:
 *                 type: string
 *               responsibilities:
 *                 type: string
 *     responses:
 *       201:
 *         description: Policy created successfully
 *       400:
 *         description: Missing required field (e.g., deptCode)
 *       500:
 *         description: Server error
 */
router.post("/new", createPolicy);

/**
 * @swagger
 * /api/v1/policies/version:
 *   post:
 *     summary: Add a new version to an existing policy
 *     tags: [Policies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policyId
 *               - versionType
 *               - preparedBy
 *               - effectiveDate
 *             properties:
 *               policyId:
 *                 type: string
 *                 example: 68c298781d438b2a6250fd02
 *               versionType:
 *                 type: string
 *                 enum: [minor, major]
 *                 example: minor
 *               preparedBy:
 *                 type: string
 *                 example: 68b000c139451ac7e97cdbf3
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-10-01
 *               objective:
 *                 type: string
 *               scope:
 *                 type: string
 *               policies:
 *                 type: string
 *               abbrevations:
 *                 type: string
 *               responsibilities:
 *                 type: string
 *     responses:
 *       201:
 *         description: Policy version added successfully
 *       404:
 *         description: Policy not found
 *       500:
 *         description: Server error
 */
router.post("/version", addPolicyVersion);

/**
 * @swagger
 * /api/v1/policies:
 *   get:
 *     summary: Get all policies with their versions
 *     tags: [Policies]
 *     responses:
 *       200:
 *         description: List of all policies
 *       500:
 *         description: Server error
 */
router.get("/", getPolicies);

/**
 * @swagger
 * /api/v1/policies/department/{departmentId}:
 *   get:
 *     summary: Get policies by department ID
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         description: ID of the department
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policies retrieved successfully
 *       404:
 *         description: No policies found for the given department
 *       500:
 *         description: Internal server error
 */
router.get("/department/:departmentId", getPoliciesByDepartmentId);

/**
 * @swagger
 * /api/v1/policies/{id}:
 *   get:
 *     summary: Get all versions of a specific policy
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Policy ID
 *     responses:
 *       200:
 *         description: Policy with all versions
 *       404:
 *         description: Policy not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getPolicyVersionsByPolicyId);

/**
 * @swagger
 * /api/v1/policies/version/{id}:
 *   get:
 *     summary: Get a specific policy version by ID
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: PolicyVersion ID
 *     responses:
 *       200:
 *         description: Policy version details
 *       404:
 *         description: Policy version not found
 *       500:
 *         description: Server error
 */
router.get("/version/:id", getPolicyVersionById);

/**
 * @swagger
 * /api/v1/policies/version/review:
 *   post:
 *     summary: Review a policy version
 *     tags: [Policies]
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
 *                 example: 68c2a0c57a438b2a6250fe11
 *               reviewedBy:
 *                 type: string
 *                 example: 68b111c139451ac7e97cda22
 *               comments:
 *                 type: string
 *                 example: "The policy draft is clear and acceptable."
 *               status:
 *                 type: string
 *                 enum: [draft, under_review, approved]
 *               nextReviewDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Policy version reviewed successfully
 *       404:
 *         description: Policy version not found
 *       500:
 *         description: Server error
 */
router.post("/version/review", reviewPolicyVersion);

/**
 * @swagger
 * /api/v1/policies/version/approve:
 *   post:
 *     summary: Approve a policy version
 *     tags: [Policies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - versionId
 *               - lastVersionId
 *               - approvedBy
 *             properties:
 *               versionId:
 *                 type: string
 *                 example: 68c2a0c57a438b2a6250fe11\
 *               lastVersionId:
 *                 type: string
 *                 example: 68c2a0c57a438b2a6250fe11
 *               approvedBy:
 *                 type: string
 *                 example: 68b000c139451ac7e97cdbf3
 *     responses:
 *       200:
 *         description: Policy version approved successfully
 *       404:
 *         description: Policy version not found
 *       500:
 *         description: Server error
 */
router.post("/version/approve", approvePolicyVersion);

export default router;
