import express from "express";
import { addNewDeviationCategory, deleteDeviationCategory, getAllDeviationCategories, getDeviationCategoryById, updateDeviationCategory } from "../../controllers/deviation/deviationCategoryControllers.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/deviationCategories/newDeviationCategory:
 *   post:
 *     summary: Create a new deviation category
 *     tags: [DeviationCategories]
 *     description: Add a new deviation category to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 required: true
 *                 example: Environmental
 *     responses:
 *       201:
 *         description: Deviation category created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/newDeviationCategory", addNewDeviationCategory);

/**
 * @swagger
 * /api/v1/deviationCategories:
 *   get:
 *     summary: Retrieve all deviation categories
 *     tags: [DeviationCategories]
 *     description: Fetch a list of all deviation categories with name search
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter deviation categories by name.
 *     responses:
 *       200:
 *         description: Deviation categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deviationCategories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       categoryName:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllDeviationCategories);

/**
 * @swagger
 * /api/v1/deviationCategories/{id}:
 *   get:
 *     summary: Retrieve deviation category using deviation category id
 *     tags: [DeviationCategories]
 *     description: deviation category using deviation category id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the deviation category to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deviation category retrieved successfully
 *         content:
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getDeviationCategoryById);

/**
 * @swagger
 * /api/v1/deviationCategories/update/{id}:
 *   put:
 *     summary: Update deviaton category by ID
 *     tags: [DeviationCategories]
 *     description: Update a deviation category by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the deviation category to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: Environmental
 *     responses:
 *       200:
 *         description: Deviation Category updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Deviation category not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:id", updateDeviationCategory);

/**
 * @swagger
 * /api/v1/deviationCategories/{id}:
 *   delete:
 *     summary: Delete deviation category by ID
 *     tags: [DeviationCategories]
 *     description: Delete a deviation category by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the deviation category to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: deviation category deleted successfully
 *       404:
 *         description: deviation category not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteDeviationCategory);

export default router;