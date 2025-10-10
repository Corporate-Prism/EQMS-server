import Policy from "../../models/policy/Policy.js";
import PolicyReview from "../../models/policy/PolicyReview.js";
import PolicyVersion from "../../models/policy/PolicyVersion.js";

export const createPolicy = async (req, res) => {
  try {
    const {
      policyName,
      department,
      deptCode,
      versionType,
      preparedBy,
      effectiveDate,
      objective,
      scope,
      policies,
      abbrevations,
      responsibilities,
    } = req.body;

    if (!deptCode) {
      return res
        .status(400)
        .json({ success: false, message: "deptCode is required" });
    }

    // 1. Find the last policy for this deptCode
    const lastPolicy = await Policy.findOne({ deptCode })
      .sort({ createdAt: -1 })
      .select("referrenceNumber");

    let nextNumber = "001";

    if (lastPolicy && lastPolicy.referrenceNumber) {
      // Extract last number from "POL-{deptCode}-XXX"
      const lastNum = parseInt(
        lastPolicy.referrenceNumber.split("-").pop(),
        10
      );
      nextNumber = String(lastNum + 1).padStart(3, "0");
    }

    // 2. Build reference number
    const referrenceNumber = `POL-${deptCode}-${nextNumber}`;

    const newPolicy = new Policy({
      policyName,
      department,
      deptCode,
      referrenceNumber,
    });

    const newVersion = new PolicyVersion({
      policy: newPolicy._id,
      versionType,
      preparedBy,
      effectiveDate,
      objective,
      scope,
      policies,
      abbrevations,
      responsibilities,
      status: "under_review",
    });

    await newPolicy.save();
    await newVersion.save();

    return res.status(201).json({ success: true, data: newPolicy });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addPolicyVersion = async (req, res) => {
  try {
    const {
      policyId,
      versionType,
      preparedBy,
      effectiveDate,
      objective,
      scope,
      policies,
      abbrevations,
      responsibilities,
    } = req.body;

    if (!policyId) {
      return res
        .status(400)
        .json({ success: false, message: "Policy ID is required" });
    }

    const existingPolicy = await Policy.findById(policyId);
    if (!existingPolicy) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found" });
    }

    const newVersion = new PolicyVersion({
      policy: policyId,
      versionType,
      preparedBy,
      effectiveDate,
      objective,
      scope,
      policies,
      abbrevations,
      responsibilities,
      status: "under_review",
    });

    await newVersion.save();
    return res.status(201).json({ success: true, data: newVersion });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().populate("versions");
    return res.status(200).json({ success: true, data: policies });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPoliciesByDepartmentId = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const policies = await Policy.find({ department: departmentId }).populate(
      "versions"
    );
    return res.status(200).json({ success: true, data: policies });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPolicyVersionsByPolicyId = async (req, res) => {
  try {
    // const { id } = req.params;
    // const policy = await Policy.findById(id).populate("versions");
    const policy = await Policy.findById(req.params.id).populate({
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

    if (!policy) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found" });
    }

    return res.status(200).json({ success: true, data: policy });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPolicyVersionById = async (req, res) => {
  try {
    const { id } = req.params;
    // const version = await PolicyVersion.findById(id).populate(
    //   "reviews preparedBy approvedBy"
    // );

    const version = await PolicyVersion.findById(req.params.id).populate([
      { path: "preparedBy" },
      { path: "approvedBy" },
      {
        path: "reviews",
        populate: { path: "reviewedBy" },
      },
    ]);

    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Policy version not found" });
    }

    return res.status(200).json({ success: true, data: version });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewPolicyVersion = async (req, res) => {
  try {
    const { versionId, reviewedBy, comments, status, nextReviewDate } =
      req.body;

    const version = await PolicyVersion.findById(versionId);
    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Policy version not found" });
    }

    const newReview = new PolicyReview({
      policyVersion: versionId,
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

export const approvePolicyVersion = async (req, res) => {
  try {
    const { versionId, approvedBy } = req.body;

    const version = await PolicyVersion.findById(versionId);
    const lastVersion = await PolicyVersion.findOne({
      status: "approved",
    }).sort({ createdAt: -1 });

    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Policy Version not found" });
    }

    version.status = "approved";
    version.approvedBy = approvedBy;

    if (lastVersion) {
      lastVersion.status = "archived";
      await lastVersion.save();
    }
    await version.save();

    return res.status(200).json({
      success: true,
      message: "Manual version approved successfully",
      data: version,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const editPolicyVersion = async (req, res) => {
  try {
    const { versionId } = req.params;
    const updateData = req.body;

    // Check if the policy version exists
    const existingVersion = await PolicyVersion.findById(versionId);
    if (!existingVersion) {
      return res
        .status(404)
        .json({ success: false, message: "Policy version not found" });
    }

    // Prevent editing approved or archived versions
    if (
      existingVersion.status === "approved" ||
      existingVersion.status === "archived"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit approved or archived policy versions",
      });
    }

    // Update the policy version
    const updatedVersion = await PolicyVersion.findByIdAndUpdate(
      versionId,
      updateData,
      { new: true, runValidators: true }
    ).populate("preparedBy approvedBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Policy version updated successfully",
      data: updatedVersion,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
