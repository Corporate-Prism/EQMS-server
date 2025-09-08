import RolePermission from "../models/RolePermissions.js";

export const assignPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    if (!roleId || !permissionId) {
      return res
        .status(400)
        .json({ message: "roleId and permissionId are required" });
    }

    // Check if the permission is already assigned to the role
    const existingAssignment = await RolePermission.findOne({
      role: roleId,
      permission: permissionId,
    });

    if (existingAssignment) {
      return res
        .status(400)
        .json({ message: "Permission already assigned to this role" });
    }

    const rolePermission = new RolePermission({
      role: roleId,
      permission: permissionId,
    });

    await rolePermission.save();

    return res
      .status(201)
      .json({ message: "Permission assigned to role successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const removePermissionFromRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    if (!roleId || !permissionId) {
      return res
        .status(400)
        .json({ message: "roleId and permissionId are required" });
    }

    // Check if the permission is assigned to the role
    const existingAssignment = await RolePermission.findOne({
      role: roleId,
      permission: permissionId,
    });

    if (!existingAssignment) {
      return res
        .status(400)
        .json({ message: "Permission not assigned to this role" });
    }

    await RolePermission.deleteOne({
      role: roleId,
      permission: permissionId,
    });

    return res
      .status(200)
      .json({ message: "Permission removed from role successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const bulkAssignPermissionsToRole = async (req, res) => {
  try {
    const { roleId, permissionIds } = req.body;

    if (
      !roleId ||
      !Array.isArray(permissionIds) ||
      permissionIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "roleId and an array of permissionIds are required" });
    }

    const assignments = permissionIds.map((permissionId) => ({
      role: roleId,
      permission: permissionId,
    }));

    await RolePermission.insertMany(assignments, { ordered: false });

    return res
      .status(201)
      .json({ message: "Permissions assigned to role successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
