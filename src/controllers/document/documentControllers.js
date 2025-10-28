// import Manual from "../../models/manuals/Manual.js";
// import Policy from "../../models/policy/Policy.js";
// import Procedure from "../../models/procedures/Procedure.js";
// import WorkInstruction from "../../models/work-instructions/WorkInstruction.js";

// const modelMap = {
//     manual: { model: Manual, nameField: "manualName" },
//     policy: { model: Policy, nameField: "policyName" },
//     procedure: { model: Procedure, nameField: "procedureName" },
//     workinstruction: { model: WorkInstruction, nameField: "workInstructionName" },
// };

// export const getDocumentsByTypeAndDepartment = async (req, res) => {
//     try {
//         const { documentType, departmentId } = req.query;

//         if (!departmentId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User department not found in request",
//             });
//         }

//         const config = modelMap[documentType?.toLowerCase()];
//         if (!config) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid document type provided",
//             });
//         }

//         const { model: Model, nameField } = config;

//         const documents = await Model.find({ department: departmentId })
//             .select(`${nameField} deptCode referrenceNumber department`)
//             .populate("department", "departmentName");

//         const formatted = documents.map((doc) => ({
//             _id: doc._id,
//             name: doc[nameField],
//             referenceNumber: doc.referrenceNumber,
//             deptCode: doc.deptCode,
//             department: doc.department,
//         }));

//         return res.status(200).json({
//             success: true,
//             data: formatted,
//         });
//     } catch (error) {
//         console.error("Error fetching documents:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

import mongoose from "mongoose";
import Manual from "../../models/manuals/Manual.js";
import Policy from "../../models/policy/Policy.js";
import Procedure from "../../models/procedures/Procedure.js";
import WorkInstruction from "../../models/work-instructions/WorkInstruction.js";

const modelMap = {
  manual: { model: Manual, nameField: "manualName" },
  policy: { model: Policy, nameField: "policyName" },
  procedure: { model: Procedure, nameField: "procedureName" },
  workinstruction: { model: WorkInstruction, nameField: "workInstructionName" },
};

export const getDocumentsByTypeAndDepartment = async (req, res) => {
  try {
    const { documentType } = req.query;
    const config = modelMap[documentType?.toLowerCase()];

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type provided",
      });
    }

    const { model: Model, nameField } = config;

    // 👇 Use department filter from middleware if available
    // Otherwise fallback to all departments (for QA or Admin users)
    const departmentFilter = req.departmentFilter || {};

    // Ensure the filter uses ObjectId correctly if departmentId exists
    if (departmentFilter.department && typeof departmentFilter.department === "string") {
      departmentFilter.department = new mongoose.Types.ObjectId(departmentFilter.department);
    }

    const documents = await Model.find(departmentFilter)
      .select(`${nameField} deptCode referrenceNumber department`)
      .populate("department", "departmentName");

    const formatted = documents.map((doc) => ({
      _id: doc._id,
      name: doc[nameField],
      referenceNumber: doc.referrenceNumber,
      deptCode: doc.deptCode,
      department: doc.department,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
