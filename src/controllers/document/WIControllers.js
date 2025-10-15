import WIVersion from "../../models/work-instructions/WIVersion.js";
import WorkInstruction from "../../models/work-instructions/WorkInstruction.js";
import WIReview from "../../models/work-instructions/WIReview.js";

export const createWI = async (req, res) => {
  try {
    const {
      workInstructionName,
      department,
      deptCode,
      versionType,
      preparedBy,
      effectiveDate,
      purpose,
      scope,
      instructions,
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
    const lastWI = await WorkInstruction.findOne({ deptCode })
      .sort({ createdAt: -1 })
      .select("referrenceNumber");

    let nextNumber = "001";

    if (lastWI && lastWI.referrenceNumber) {
      // Extract last number from "WI-{deptCode}-XXX"
      const lastNum = parseInt(lastWI.referrenceNumber.split("-").pop(), 10);
      nextNumber = String(lastNum + 1).padStart(3, "0");
    }

    // 2. Build reference number
    const referrenceNumber = `WI-${deptCode}-${nextNumber}`;

    const newWI = new WorkInstruction({
      workInstructionName,
      department,
      deptCode,
      referrenceNumber,
    });

    const newVersion = new WIVersion({
      workInstruction: newWI._id,
      versionType,
      preparedBy,
      effectiveDate,
      purpose,
      scope,
      instructions,
      abbrevations,
      responsibilities,
      status: "under_review",
      metaData,
    });

    await newWI.save();
    await newVersion.save();

    return res.status(201).json({ success: true, data: newWI });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addWIVersion = async (req, res) => {
  try {
    const {
      WIid,
      versionType,
      preparedBy,
      effectiveDate,
      purpose,
      scope,
      instructions,
      abbrevations,
      responsibilities,
      metaData = {},
    } = req.body;

    if (!WIid) {
      return res
        .status(400)
        .json({ success: false, message: "Work Instruction ID is required" });
    }

    const existingWI = await WorkInstruction.findById(WIid);
    if (!existingWI) {
      return res
        .status(404)
        .json({ success: false, message: "Work Instruction not found" });
    }

    const newVersion = new WIVersion({
      workInstruction: WIid,
      versionType,
      preparedBy,
      effectiveDate,
      purpose,
      scope,
      instructions,
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

export const getWIs = async (req, res) => {
  try {
    const WIs = await WorkInstruction.find().populate("versions");
    return res.status(200).json({ success: true, data: WIs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWIsByDepartmentId = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const WIs = await WorkInstruction.find({
      department: departmentId,
    }).populate("versions");
    return res.status(200).json({ success: true, data: WIs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWIVersionsByWIId = async (req, res) => {
  try {
    const { id } = req.params;

    // const WI = await WorkInstruction.findById(id).populate({
    //   path: "versions",
    // });

    const WI = await WorkInstruction.findById(id).populate({
      path: "versions",
      options: { sort: { createdAt: -1 } },
      populate: [
        { path: "preparedBy", select: "name email" },
        { path: "approvedBy", select: "name email" },
        {
          path: "reviews",
          populate: { path: "reviewedBy", select: "name email" },
          options: { sort: { createdAt: -1 }, limit: 1 }, // Get only the last review
        },
      ],
    });

    if (!WI) {
      return res
        .status(404)
        .json({ success: false, message: "Work Instruction not found" });
    }

    return res.status(200).json({ success: true, data: WI });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWIVersionById = async (req, res) => {
  try {
    const { id } = req.params;
    // const version = await WIVersion.findById(id).populate(
    //   "reviews preparedBy approvedBy"
    // );

    const version = await WIVersion.findById(req.params.id).populate([
      { path: "preparedBy" },
      { path: "approvedBy" },
      {
        path: "reviews",
        populate: { path: "reviewedBy" },
      },
    ]);

    if (!version) {
      return res.status(404).json({
        success: false,
        message: "Work Instruction version not found",
      });
    }

    return res.status(200).json({ success: true, data: version });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewWIVersion = async (req, res) => {
  try {
    const { versionId, reviewedBy, comments, status, nextReviewDate } =
      req.body;

    const version = await WIVersion.findById(versionId);
    if (!version) {
      return res.status(404).json({
        success: false,
        message: "Work Instruction version not found",
      });
    }

    const newReview = new WIReview({
      wiVersion: versionId,
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

export const approveWIVersion = async (req, res) => {
  try {
    const { versionId, approvedBy } = req.body;

    const version = await WIVersion.findById(versionId);
    const lastVersion = await WIVersion.findOne({ status: "approved" }).sort({
      createdAt: -1,
    });

    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Work Instrction Version not found" });
    }

    version.status = "approved";
    version.approvedBy = approvedBy;
    lastVersion.status = "archived";

    await version.save();
    await lastVersion.save();

    return res.status(200).json({
      success: true,
      message: "Work Instrcution version approved successfully",
      data: version,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const editWIVersion = async (req, res) => {
  try {
    const { versionId } = req.params;
    const updateData = req.body;

    // Check if the work instruction version exists
    const existingVersion = await WIVersion.findById(versionId);
    if (!existingVersion) {
      return res.status(404).json({
        success: false,
        message: "Work instruction version not found",
      });
    }

    // Prevent editing approved or archived versions
    if (
      existingVersion.status === "approved" ||
      existingVersion.status === "archived"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit approved or archived work instruction versions",
      });
    }

    // Update the work instruction version
    const updatedVersion = await WIVersion.findByIdAndUpdate(
      versionId,
      updateData,
      { new: true, runValidators: true }
    ).populate("preparedBy approvedBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Work instruction version updated successfully",
      data: updatedVersion,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
