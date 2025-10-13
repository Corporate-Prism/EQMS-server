//not tested yet, will be tested once deviation model is completed

import express from "express";
import {
  addDeviationImpact,
  getAllDeviationImpacts,
  getDeviationImpactById,
  updateDeviationImpact,
  deleteDeviationImpact,
} from "../controllers/deviationImpactController.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/deviationImpacts:
 *   get:
 *     summary: Get all deviation impact assessments
 *     tags: [Deviation Impact]
 *     responses:
 *       200:
 *         description: List of deviation impacts
 */
router.get("/", getAllDeviationImpacts);

/**
 * @swagger
 * /api/v1/deviationImpacts/{id}:
 *   get:
 *     summary: Get deviation impact by ID
 *     tags: [Deviation Impact]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deviation impact details
 */
router.get("/:id", getDeviationImpactById);

/**
 * @swagger
 * /api/v1/deviationImpacts:
 *   post:
 *     summary: Create new deviation impact
 *     tags: [Deviation Impact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviationId:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
 *                     comment:
 *                       type: string
 *     responses:
 *       201:
 *         description: Created successfully
 */
router.post("/", addDeviationImpact);

/**
 * @swagger
 * /api/v1/deviationImpacts/{id}:
 *   put:
 *     summary: Update deviation impact
 *     tags: [Deviation Impact]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put("/:id", updateDeviationImpact);

/**
 * @swagger
 * /api/v1/deviationImpacts/{id}:
 *   delete:
 *     summary: Delete deviation impact
 *     tags: [Deviation Impact]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete("/:id", deleteDeviationImpact);

export default router;
