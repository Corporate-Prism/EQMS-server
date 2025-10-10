import express from "express";
import multer from "multer";
import {
  deleteAttachment,
  uploadAttachment,
} from "../../controllers/deviation/attachmentsControllers.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * /api/v1/attachments/{deviationId}/newAttachment:
 *   post:
 *     summary: Upload an attachment for a specific deviation
 *     description: Uploads a file to Cloudinary and links it to a specific deviation record.
 *     tags: [Attachments]
 *     parameters:
 *       - name: deviationId
 *         in: path
 *         required: true
 *         description: ID of the deviation to which the attachment belongs
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - attachment
 *             properties:
 *               attachment:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded
 *     responses:
 *       200:
 *         description: Attachment uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Attachment uploaded successfully
 *                 newAttachment:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6701b3c8f3b9ad0012345678
 *                     deviationId:
 *                       type: string
 *                       example: 66ff4b82f3d1e40012a45abc
 *                     attachmentUrl:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v172839283/file.pdf
 *       400:
 *         description: Bad Request - Missing deviationId or file
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/:deviationId/newAttachment",
  upload.single("attachment"),
  uploadAttachment
);

/**
 * @swagger
 * /api/v1/attachments/{attachmentId}:
 *   delete:
 *     summary: Delete an attachment
 *     description: Deletes an attachment by its ID from the database.
 *     tags: [Attachments]
 *     parameters:
 *       - name: attachmentId
 *         in: path
 *         required: true
 *         description: ID of the attachment to delete
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Attachment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Attachment deleted successfully!
 *       404:
 *         description: Attachment not found
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
 *                   example: Attachment not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:attachmentId", deleteAttachment);

export default router;
