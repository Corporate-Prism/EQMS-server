import express from "express";
import {
  addNewDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
} from "../controllers/departmentControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Departments
 *     description: Department management
 */

/**
 * @swagger
 * /api/v1/departments/newDepartment:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     description: Add a new department to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *                 required: true
 *                 example: Human Resources
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/newDepartment", addNewDepartment);

/**
 * @swagger
 * /api/v1/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     description: Retrieve a list of all departments
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllDepartments);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     description: Retrieve a department by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the department to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department retrieved successfully
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getDepartmentById);

/**
 * @swagger
 * /api/v1/departments/update/{id}:
 *   put:
 *     summary: Update department by ID
 *     tags: [Departments]
 *     description: Update a department by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the department to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *                 example: Finance
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:id", updateDepartment);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   delete:
 *     summary: Delete department by ID
 *     tags: [Departments]
 *     description: Delete a department by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the department to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteDepartment);

export default router;
