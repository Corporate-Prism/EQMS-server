import express from "express";
import { addNewChangeCategory, deleteChangeCategory, getAllChangeCategories, getChangeCategoryById, updateChangeCategory } from "../../controllers/changeControl/changeCategoryControllers.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/changeCategories/newChangeCategory:
 *   post:
 *     summary: Create a new change category
 *     tags: [ChangeCategories]
 *     description: Add a new change category to the system
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
 *         description: Change category created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/newChangeCategory", addNewChangeCategory);

/**
 * @swagger
 * /api/v1/changeCategories:
 *   get:
 *     summary: Retrieve all change categories
 *     tags: [ChangeCategories]
 *     description: Fetch a list of all change categories with name search
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter change categories by name.
 *     responses:
 *       200:
 *         description: Change categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 changeCategories:
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
router.get("/", getAllChangeCategories);

/**
 * @swagger
 * /api/v1/changeCategories/{id}:
 *   get:
 *     summary: Retrieve change category using change category id
 *     tags: [ChangeCategories]
 *     description: change category using change category id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the change category to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Change category retrieved successfully
 *         content:
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getChangeCategoryById);

/**
 * @swagger
 * /api/v1/changeCategories/update/{id}:
 *   put:
 *     summary: Update deviaton category by ID
 *     tags: [ChangeCategories]
 *     description: Update a change category by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the change category to update
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
 *         description: Change Category updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Change category not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:id", updateChangeCategory);

/**
 * @swagger
 * /api/v1/changeCategories/{id}:
 *   delete:
 *     summary: Delete change category by ID
 *     tags: [ChangeCategories]
 *     description: Delete a change category by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the change category to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: change category deleted successfully
 *       404:
 *         description: change category not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteChangeCategory);

export default router;