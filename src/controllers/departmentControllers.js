import Department from "../models/Department.js";

export const addNewDepartment = async (req, res) => {
  try {
    const { departmentName } = req.body;

    if (!departmentName) {
      return res.status(400).json({ message: "Department name is required" });
    }

    const newDepartment = new Department({
      departmentName,
    });

    await newDepartment.save();

    return res
      .status(201)
      .json({
        message: "Department created successfully",
        department: newDepartment,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const getAllDepartments = async (req, res) => {
  try {
    const baseFilter = req.departmentFilter || {};
    let query = { ...baseFilter };
    if (query.department) {
      query = { _id: query.department };
      delete query.department;
    }
    const departments = await Department.find(query);
    return res.status(200).json({ departments });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    return res.status(200).json({ department });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentName } = req.body;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    department.departmentName = departmentName || department.departmentName;

    await department.save();

    return res
      .status(200)
      .json({ message: "Department updated successfully", department });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    return res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};
