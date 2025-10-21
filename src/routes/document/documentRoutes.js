import express from "express";
import { getDocumentsByTypeAndDepartment } from "../../controllers/document/documentControllers.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/documents:
 *   get:
 *     summary: Get documents for a specific department and type
 *     description: |
 *       Fetches documents (Manuals, Policies, Procedures, or Work Instructions)
 *       for the specified department based on query parameters.
 *
 *     tags:
 *       - Documents
 *
 *     parameters:
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
 *         required: true
 *         description: ID of the department to fetch documents for
 *         schema:
 *           type: string
 *           example: 66f89f1234567890abcd0001
 *
 *     security:
 *       - bearerAuth: []
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
 *                       department:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 66f89f1234567890abcd0001
 *                           name:
 *                             type: string
 *                             example: Quality Control
 *                           code:
 *                             type: string
 *                             example: QC
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

router.get(`/`, getDocumentsByTypeAndDepartment)

export default router;