import Procedure from "../models/procedures/Procedure.js";
import ProcedureVersion from "../models/procedures/ProcedureVersion.js";
import ProcedureReview from "../models/procedures/ProcedureReview.js";

export const createProcedure = async (req, res) => {
  try {
    const {
      procedureName,
      department,
      deptCode,
      versionType,
      preparedBy,
      effectiveDate,
      purpose,
      scope,
      procedures,
      abbrevations,
      responsibilities,
      metaData = {},
    } = req.body;

    if (!deptCode) {
      return res
        .status(400)
        .json({ success: false, message: "deptCode is required" });
    }

    // 1. Find the last policy for this deptCode
    const lastProcedure = await Procedure.findOne({ deptCode })
      .sort({ createdAt: -1 })
      .select("referrenceNumber");

    let nextNumber = "001";

    if (lastProcedure && lastProcedure.referrenceNumber) {
      // Extract last number from "SOP-{deptCode}-XXX"
      const lastNum = parseInt(
        lastProcedure.referrenceNumber.split("-").pop(),
        10
      );
      nextNumber = String(lastNum + 1).padStart(3, "0");
    }

    // 2. Build reference number
    const referrenceNumber = `SOP-${deptCode}-${nextNumber}`;

    const newProcedure = new Procedure({
      procedureName,
      department,
      deptCode,
      referrenceNumber,
    });

    const newVersion = new ProcedureVersion({
      procedure: newProcedure._id,
      versionType,
      preparedBy,
      effectiveDate,
      purpose,
      scope,
      procedures,
      abbrevations,
      responsibilities,
      status: "under_review",
      metaData,
    });

    await newProcedure.save();
    await newVersion.save();

    return res.status(201).json({ success: true, data: newProcedure });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addProcedureVersion = async (req, res) => {
  try {
    const {
      procedureId,
      versionType,
      preparedBy,
      effectiveDate,
      purpose,
      scope,
      procedures,
      abbrevations,
      responsibilities,
      metaData = {},
    } = req.body;

    if (!procedureId) {
      return res
        .status(400)
        .json({ success: false, message: "PROCEDURE ID is required" });
    }

    const existingProcedure = await Procedure.findById(procedureId);
    if (!existingProcedure) {
      return res
        .status(404)
        .json({ success: false, message: "Procedure not found" });
    }

    const newVersion = new ProcedureVersion({
      procedure: procedureId,
      versionType,
      preparedBy,
      effectiveDate,
      purpose,
      scope,
      procedures,
      abbrevations,
      responsibilities,
      status: "under_review",
      metaData,
    });

    await newVersion.save();
    return res.status(201).json({ success: true, data: newVersion });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProcedures = async (req, res) => {
  try {
    const procedures = await Procedure.find().populate("versions");
    return res.status(200).json({ success: true, data: procedures });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProceuresByDepartmentId = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const procedures = await Procedure.find({
      department: departmentId,
    }).populate("versions");
    return res.status(200).json({ success: true, data: procedures });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProcedureVersionsByProcedureId = async (req, res) => {
  try {
    const { id } = req.params;
    // const procedure = await Procedure.findById(id).populate("versions");
    const procedure = await Procedure.findById(req.params.id).populate({
      path: "versions",
      populate: [
        { path: "preparedBy", select: "name email" },
        { path: "approvedBy", select: "name email" },
        {
          path: "reviews",
          populate: { path: "reviewedBy", select: "name email" },
        },
      ],
    });

    if (!procedure) {
      return res
        .status(404)
        .json({ success: false, message: "Procedure not found" });
    }

    return res.status(200).json({ success: true, data: procedure });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProcedureVersionById = async (req, res) => {
  try {
    const { id } = req.params;
    const version = await ProcedureVersion.findById(id).populate(
      "reviews preparedBy approvedBy"
    );
    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Procedure version not found" });
    }

    return res.status(200).json({ success: true, data: version });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewProcedureVersion = async (req, res) => {
  try {
    const { versionId, reviewedBy, comments, status, nextReviewDate } =
      req.body;

    const version = await ProcedureVersion.findById(versionId);
    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Procedure version not found" });
    }

    const newReview = new ProcedureReview({
      procedureVersion: versionId,
      reviewedBy,
      comments,
    });

    if (status) {
      version.status = status;
    }
    if (nextReviewDate) {
      version.nextReviewDate = nextReviewDate;
    }

    await newReview.save();
    await version.save();

    return res.status(200).json({ success: true, data: version });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveProcedureVersion = async (req, res) => {
  try {
    const { lastVersionId, versionId, approvedBy } = req.body;

    const version = await ProcedureVersion.findById(versionId);
    const lastVersion = await ProcedureVersion.findById(lastVersionId);

    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Procedure Version not found" });
    }

    if (!lastVersion) {
      return res
        .status(404)
        .json({ success: false, message: "Procedure Version not found" });
    }

    version.status = "approved";
    version.approvedBy = approvedBy;
    lastVersion.status = "archieved";

    await version.save();
    await lastVersion.save();

    return res.status(200).json({
      success: true,
      message: "Procedure version approved successfully",
      data: version,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
