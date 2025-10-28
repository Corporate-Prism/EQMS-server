import express from "express";
import { getDocumentsByTypeAndDepartment } from "../../controllers/document/documentControllers.js";
import { authAndAuthorize, departmentAccessMiddleware } from "../../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/documents:
 *   get:
 *     summary: Get documents by type and department
 *     description: |
 *       Fetches documents (Manuals, Policies, Procedures, or Work Instructions).
 *       - Users with **QA** department can access all departments' data.  
 *       - Users from other departments can only access documents of **their own department**.
 *
 *     tags:
 *       - Documents
 *
 *     security:
 *       - bearerAuth: []  # 👈 required so Swagger UI shows the Authorize button
 *
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication (e.g. `Bearer <token>`)
 *         schema:
 *           type: string
 *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *       - in: query
 *         name: documentType
 *         required: true
 *         description: Type of document to fetch
 *         schema:
 *           type: string
 *           enum: [manual, policy, procedure, workinstruction]
 *           example: manual
 *
 *       - in: query
 *         name: departmentId
 *         required: false
 *         description: Department ID (optional — used only by QA or Admin users)
 *         schema:
 *           type: string
 *           example: 66f89f1234567890abcd0001
 *
 *     responses:
 *       200:
 *         description: Successfully fetched documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 67124f9c1234567890abcd12
 *                       name:
 *                         type: string
 *                         example: SOP for Cleaning Validation
 *                       referenceNumber:
 *                         type: string
 *                         example: SOP-102
 *                       deptCode:
 *                         type: string
 *                         example: QC
 *                       department:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 66f89f1234567890abcd0001
 *                           departmentName:
 *                             type: string
 *                             example: Quality Control
 *
 *       400:
 *         description: Invalid parameters
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
 *                   example: Invalid documentType or missing departmentId
 *
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization header missing or invalid
 *
 *       500:
 *         description: Server error
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
 *                   example: Internal server error
 */

router.get(
  `/`,
  authAndAuthorize("System Admin", "Creator", "Reviewer", "Approver"),                 // ✅ Verify JWT
  departmentAccessMiddleware,    
  getDocumentsByTypeAndDepartment
);

export default router;
