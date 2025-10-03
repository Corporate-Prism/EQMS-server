import express from "express";
import {
  assignPermissionToRole,
  bulkAssignPermissionsToRole,
  bulkRemovePermissionsFromRole,
  getRolePermissions,
  removePermissionFromRole,
} from "../controllers/RolePermissionControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: RolePermissions
 *     description: Role and Permission management
 */

/**
 * @swagger
 * /api/v1/rolePermissions/assignRolePermission:
 *   post:
 *     summary: Assign a permission to a role
 *     tags: [RolePermissions]
 *     description: Assign a specific permission to a role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: 64a7f0c8e4b0c8a1b2c3d4e5
 *               permissionId:
 *                 type: string
 *                 example: 64a7f0c8e4b0c8a1b2c3d4e6
 *     responses:
 *       201:
 *         description: Permission assigned to role successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/assignRolePermission", assignPermissionToRole);

/**
 * @swagger
 * /api/v1/rolePermissions/removeRolePermission:
 *   delete:
 *     summary: Remove a permission from a role
 *     tags: [RolePermissions]
 *     description: Remove a specific permission from a role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: 64a7f0c8e4b0c8a1b2c3d4e5
 *               permissionId:
 *                 type: string
 *                 example: 64a7f0c8e4b0c8a1b2c3d4e6
 *     responses:
 *       200:
 *         description: Permission removed from role successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete("/removeRolePermission", removePermissionFromRole);

/**
 * @swagger
 * /api/v1/rolePermissions/assignRolePermission/bulk:
 *   post:
 *     summary: Bulk assign permissions to a role
 *     tags: [RolePermissions]
 *     description: Assign multiple permissions to a role in a single request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: 64a7f0c8e4b0c8a1b2c3d4e5
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 64a7f0c8e4b0c8a1b2c3d4e6
 *                   - 64a7f0c8e4b0c8a1b2c3d4e7
 *                   - 64a7f0c8e4b0c8a1b2c3d4e8
 *     responses:
 *       201:
 *         description: Permissions assigned to role successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

router.post("/assignRolePermission/bulk", bulkAssignPermissionsToRole);

/**
 * @swagger
 * /api/v1/rolePermissions/{roleId}:
 *   get:
 *     summary: Get all permissions assigned to a role
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID to retrieve permissions for
 *     responses:
 *       200:
 *         description: List of role permissions
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/:roleId", getRolePermissions);

/**
 * @swagger
 * /roles/permissions/remove:
 *   delete:
 *     summary: Bulk remove permissions from a role
 *     description: Removes multiple permissions from a specific role by providing the roleId and an array of permissionIds.
 *     tags:
 *       - RolePermissions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permissionIds
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: "652f9e31c0a4b2f2d4e9abcd"
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["652f9e31c0a4b2f2d4e9abc1", "652f9e31c0a4b2f2d4e9abc2"]
 *     responses:
 *       200:
 *         description: Permissions removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permissions removed from role successfully
 *       400:
 *         description: Missing roleId or permissionIds
 *       500:
 *         description: Internal server error
 */
router.delete("/remove/bulk", bulkRemovePermissionsFromRole);

export default router;
