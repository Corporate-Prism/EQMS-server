import Manual from "../models/manuals/Manual.js";
import ManualReview from "../models/manuals/ManualReview.js";
import ManualVersion from "../models/manuals/ManualVersion.js";

export const createManual = async (req, res) => {
  try {
    const {
      manualName,
      department,
      deptCode,
      versionType,
      introduction,
      objective,
      purpose,
      scope,
      policyStatement,
      organizationalStructure,
      effectiveDate,
      preparedBy,
    } = req.body;

    if (!deptCode) {
      return res
        .status(400)
        .json({ success: false, message: "deptCode is required" });
    }

    // 1. Find the last policy for this deptCode
    const lastManual = await Manual.findOne({ deptCode })
      .sort({ createdAt: -1 })
      .select("referrenceNumber");

    let nextNumber = "001";

    if (lastManual && lastManual.referrenceNumber) {
      // Extract last number from "MAN-{deptCode}-XXX"
      const lastNum = parseInt(
        lastManual.referrenceNumber.split("-").pop(),
        10
      );
      nextNumber = String(lastNum + 1).padStart(3, "0");
    }

    // 2. Build reference number
    const referrenceNumber = `MAN-${deptCode}-${nextNumber}`;

    const newManual = new Manual({
      manualName,
      department,
      deptCode,
      referrenceNumber,
    });

    const newVersion = new ManualVersion({
      manual: newManual._id,
      versionType,
      introduction,
      objective,
      purpose,
      scope,
      policyStatement,
      organizationalStructure,
      effectiveDate,
      preparedBy,
      status: "under_review",
    });

    await newManual.save();
    await newVersion.save();

    return res.status(201).json({ success: true, data: newManual });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addManualVersion = async (req, res) => {
  try {
    const {
      manualId,
      versionType,
      introduction,
      objective,
      purpose,
      scope,
      policyStatement,
      organizationalStructure,
      effectiveDate,
      preparedBy,
    } = req.body;

    const manual = await Manual.findById(manualId);
    if (!manual) {
      return res
        .status(404)
        .json({ success: false, message: "Manual not found" });
    }

    const newVersion = new ManualVersion({
      manual: manualId,
      versionType,
      introduction,
      objective,
      purpose,
      scope,
      policyStatement,
      organizationalStructure,
      effectiveDate,
      preparedBy,
      status: "under_review",
    });

    await newVersion.save();
    return res.status(201).json({ success: true, data: newVersion });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getManuals = async (req, res) => {
  try {
    const manuals = await Manual.find().populate("versions");
    return res.status(200).json({ success: true, data: manuals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getManualsByDepartmentId = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const manuals = await Manual.find({ department: departmentId }).populate(
      "versions"
    );
    return res.status(200).json({ success: true, data: manuals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getManualVersionsByManualId = async (req, res) => {
  try {
    // const manual = await Manual.findById(req.params.id).populate("versions");
    const manual = await Manual.findById(req.params.id).populate({
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
    if (!manual) {
      return res
        .status(404)
        .json({ success: false, message: "Manual not found" });
    }
    return res.status(200).json({ success: true, data: manual });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getManualVersionById = async (req, res) => {
  try {
    const version = await ManualVersion.findById(req.params.id).populate(
      "reviews preparedBy approvedBy"
    );
    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Version not found" });
    }
    return res.status(200).json({ success: true, data: version });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewManualVersion = async (req, res) => {
  try {
    const { versionId, reviewedBy, comments, status, nextReviewDate } =
      req.body;

    // 1. Find the manual version
    const version = await ManualVersion.findById(versionId);
    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Manual version not found" });
    }

    // 2. Create review
    const newReview = new ManualReview({
      manualVersion: versionId, // reference to manual version
      reviewedBy,
      comments,
    });

    // 3. Update version status (if provided)
    if (status) {
      version.status = status;
    }
    if (nextReviewDate) {
      version.nextReviewDate = nextReviewDate;
    }

    // 4. Save both
    await newReview.save();
    await version.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: newReview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveManualVersion = async (req, res) => {
  try {
    const { versionId, approvedBy } = req.body;

    const version = await ManualVersion.findById(versionId);
    const lastVersion = await ManualVersion.findOne({
      status: "approved",
    }).sort({ createdAt: -1 });

    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Manual version not found" });
    }

    version.status = "approved";
    version.approvedBy = approvedBy;
    lastVersion.status = "archived";

    await version.save();
    await lastVersion.save();

    return res.status(200).json({
      success: true,
      message: "Manual version approved successfully",
      data: version,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
