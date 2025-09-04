import express from "express";
import {
  addNewRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  updateRole,
} from "../controllers/roleControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Roles
 *     description: Role management
 */

/**
 * @swagger
 * /api/v1/roles/newRole:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     description: Add a new role to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 required: true
 *                 example: Manager
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/newRole", addNewRole);

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     description: Retrieve a list of all roles
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllRoles);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     description: Retrieve a role by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the role to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getRoleById);

/**
 * @swagger
 * /api/v1/roles/update/{id}:
 *   put:
 *     summary: Update role by ID
 *     tags: [Roles]
 *     description: Update a role by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the role to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 example: Manager
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:id", updateRole);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: Delete role by ID
 *     tags: [Roles]
 *     description: Delete a role by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the role to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteRole);

export default router;
