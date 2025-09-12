import Policy from "../models/policy/Policy.js";
import PolicyVersion from "../models/policy/PolicyVersion.js";

export const createPolicy = async (req, res) => {
  try {
    const {
      policyName,
      department,
      versionType,
      preparedBy,
      effectiveDate,
      objective,
      scope,
      policies,
      abbrevations,
      responsibilities,
    } = req.body;

    const newPolicy = new Policy({
      policyName,
      department,
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

export const getPolicyVersionsByPolicyId = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await Policy.findById(id).populate("versions");

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
    const version = await PolicyVersion.findById(id).populate(
      "reviews preparedBy approvedBy"
    );
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

    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Policy Version not found" });
    }

    version.status = "approved";
    version.approvedBy = approvedBy;
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
