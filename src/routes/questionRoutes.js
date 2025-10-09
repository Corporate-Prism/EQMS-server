import express from "express";
import { addNewQuestion, deleteQuestion, getAllQuestions, getQuestionById, updateQuestion } from "../controllers/questionsControllers.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/questions/newQuestion:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     description: Add a new question to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *                 required: true
 *                 example: Question regarding impact assesment
 *               responseType:
 *                 type: string
 *                 required: true
 *                 example: (yes or no / rating)
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/newQuestion", addNewQuestion);

/**
 * @swagger
 * /api/v1/questions:
 *   get:
 *     summary: Retrieve all questions
 *     tags: [Questions]
 *     description: Fetch a list of all questions with name search
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter questions by name.
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
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
 *                       questionText:
 *                         type: string
 *                       responseType:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllQuestions);

/**
 * @swagger
 * /api/v1/questions/{id}:
 *   get:
 *     summary: Retrieve question using question id
 *     tags: [Questions]
 *     description: question using question id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the question to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getQuestionById);

/**
 * @swagger
 * /api/v1/questions/update/{id}:
 *   put:
 *     summary: Update question by ID
 *     tags: [Questions]
 *     description: Update a question by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the question to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *                 required: true
 *                 example: Question regarding impact assesment
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Question not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:id", updateQuestion);

/**
 * @swagger
 * /api/v1/questions/{id}:
 *   delete:
 *     summary: Delete question by ID
 *     tags: [Questions]
 *     description: Delete a question by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the question to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: question deleted successfully
 *       404:
 *         description: question not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteQuestion);

export default router;