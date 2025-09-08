import Permission from "../models/Permission.js";

export const addNewPermission = async (req, res) => {
  try {
    const { permissionName } = req.body;

    if (!permissionName) {
      return res.status(400).json({ message: "Permission name is required" });
    }

    const newPermmission = new Permission({
      permissionName,
    });

    await newPermmission.save();

    return res.status(201).json({
      message: "Permission created successfully",
      permission: newPermmission,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    return res.status(200).json({ permissions });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findById(id);

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    return res.status(200).json({ permission });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionName } = req.body;

    const permission = await Permission.findById(id);

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    permission.permissionName = permissionName || permission.permissionName;

    await permission.save();

    return res
      .status(200)
      .json({ message: "Permission updated successfully", permission });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findByIdAndDelete(id);

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    return res.status(200).json({ message: "Permission deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};
