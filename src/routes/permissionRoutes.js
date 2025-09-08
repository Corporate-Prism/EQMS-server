import express from "express";
import {
  addNewPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
} from "../controllers/permissionControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Permissions
 *     description: Permission management
 */

/**
 * @swagger
 * /api/v1/permissions/newPermission:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     description: Add a new prmission to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionName:
 *                 type: string
 *                 required: true
 *                 example: CREATE_USER
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/newPermission", addNewPermission);

/**
 * @swagger
 * /api/v1/permissions:
 *   get:
 *     summary: Get all permsissions
 *     tags: [Permissions]
 *     description: Retrieve a list of all permsissions
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllPermissions);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [Permissions]
 *     description: Retrieve a permission by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the permission to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getPermissionById);

/**
 * @swagger
 * /api/v1/permissions/update/{id}:
 *   put:
 *     summary: Update permission by ID
 *     tags: [Permissions]
 *     description: Update a permission by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the permission to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionName:
 *                 type: string
 *                 example: UPDATED_PERMISSION_NAME
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:id", updatePermission);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   delete:
 *     summary: Delete permission by ID
 *     tags: [Permissions]
 *     description: Delete a permission by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the permission to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deletePermission);

export default router;
