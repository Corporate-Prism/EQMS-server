import mongoose from "mongoose";
import CAPA from "../../models/capa/Capa.js";
import Deviation from "../../models/deviation/Deviation.js";
import Attachments from "../../models/deviation/Attachments.js";
import { uploadFilesToCloudinary } from "../../../utils/uploadToCloudinary.js";
import fs from "fs";
import Auth from "../../models/Auth.js";
import CapaInvestigationTeam from "../../models/capa/CapaInvestigationTeam.js";
import ChangeControl from "../../models/change-control/ChangeControl.js";

export const createCAPA = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = req.body;
    const deviation = await Deviation.findById(body.deviation);
    if (!deviation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Deviation not found" });
    }
    const supportingFiles = req.files["supportingDocuments"] || [];
    const supportingUrls = await uploadFilesToCloudinary(supportingFiles, "eqms/capa/supporting");
    supportingFiles.forEach(file => {
      fs.unlink(file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", file.path, err);
      });
    });
    const supportingAttachments = await Attachments.insertMany(
      supportingUrls.map(url => ({
        attachmentUrl: url,
        type: "supportingDocuments",
      })),
      { session }
    );
    const [newCAPA] = await CAPA.create(
      [
        {
          initiationDate: body.initiationDate,
          targetClosureDate: body.targetClosureDate,
          reasonForCAPA: body.reasonForCAPA,
          department: body.department,
          immediateCorrectionTaken: body.immediateCorrectionTaken,
          investigationAndRootCause: body.investigationAndRootCause,
          correctiveActions: body.correctiveActions,
          preventiveActions: body.preventiveActions,
          deviation: body.deviation,
          relatedRecords: body.relatedRecord,
          supportingDocuments: {
            attachments: supportingAttachments.map(a => a._id),
          },
          createdBy: req.user._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "CAPA created successfully",
      data: newCAPA,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating CAPA:", err);
    res.status(500).json({
      success: false,
      message: "Error creating CAPA",
      error: err.message,
    });
  }
};



export const getAllCAPA = async (req, res) => {
  try {
    const capas = await CAPA.find()
      .populate("department", "departmentName")
      .populate("deviation", "deviationNumber summary")
      .populate("createdBy", "name")
      .populate("relatedRecords", "summary deviationNumber")
      .populate("supportingDocuments.attachments")
      .populate("submittedBy", "name")
      .populate("reviewedBy", "name")
      .populate("qaReviewer", "name")
      .populate("investigationAssignedBy", "name")
      .populate({
        path: "investigationTeam",
        populate: {
          path: "members.user",
          select: "name role",
          populate: {
            path: "role",
            select: "roleName"
          }
        },
      })

    res.status(200).json({
      success: true,
      message: "CAPA records retrieved successfully",
      data: capas,
    });
  } catch (err) {
    console.error("Error fetching CAPA records:", err);
    res.status(500).json({ success: false, message: "Error fetching CAPA", error: err.message });
  }
};

export const getCAPAById = async (req, res) => {
  try {
    const { id } = req.params;
    const capa = await CAPA.findById(id)
      .populate("department", "departmentName")
      .populate("deviation", "deviationNumber summary")
      .populate("createdBy", "name")
      .populate("relatedRecords", "summary deviationNumber")
      .populate("supportingDocuments.attachments")
      .populate("submittedBy", "name")
      .populate("reviewedBy", "name")
      .populate("qaReviewer", "name")
      .populate("investigationAssignedBy", "name")
      .populate({
        path: "investigationTeam",
        populate: {
          path: "members.user",
          select: "name role",
          populate: {
            path: "role",
            select: "roleName"
          }
        },
      })
      .populate({
        path: "immediateActions",
        populate: {
          path: "assignedTo",
          select: "name"
        }
      })

    if (!capa) {
      return res.status(404).json({ success: false, message: "CAPA not found" });
    }

    res.status(200).json({
      success: true,
      message: "CAPA retrieved successfully",
      data: capa,
    });
  } catch (err) {
    console.error("Error fetching CAPA by ID:", err);
    res.status(500).json({ success: false, message: "Error fetching CAPA", error: err.message });
  }
};

export const getCAPASummary = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    let query = {};
    if (req.user.department.departmentName !== "QA") query.department = req.user.department._id;
    if (search && search.trim() !== "") query.capaNumber = { $regex: search, $options: "i" };
    const isPaginationProvided = page && limit;
    const capasQuery = CAPA.find(query)
      .select("capaNumber reasonForCAPA initiationDate targetClosureDate")
      .sort({ createdAt: -1 });
    let capas, pagination;
    if (isPaginationProvided) {
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;
      const total = await CAPA.countDocuments(query);
      capas = await capasQuery
        .skip(skip)
        .limit(limitNumber);

      pagination = {
        totalRecords: total,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        limit: limitNumber,
      };
    } else {
      capas = await capasQuery;
    }
    res.status(200).json({
      success: true,
      capas,
      ...(pagination && { pagination }),
    });
  } catch (err) {
    console.error("Error fetching CAPA summary:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const submitCapaForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const capa = await CAPA.findById(id);
    if (!capa) return res.status(404).send({ message: "capa not found" });
    if (req.user.department.departmentName !== "QA" &&
      String(req.user.department._id) !== String(capa.department?._id)) {
      return res.status(403).send({
        message:
          "You can only submit capa that belong to your own department",
      });
    }
    if (capa.status !== "Draft") {
      return res.status(400).send({
        message: "Only draft capa can be submitted for review",
      });
    }
    capa.status = "Under Department Head Review";
    capa.submittedBy = req.user._id;
    capa.submittedAt = new Date();
    await capa.save();
    return res.status(200).send({
      message: "capa submitted for review successfully",
      success: true,
      capa,
    });
  } catch (error) {
    console.error("Error submitting capa:", error);
    return res.status(500).send({
      message: "Error submitting capa",
      error: error.message,
    });
  }
};

export const reviewCapa = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reviewComments } = req.body;
    const userId = req.user._id;
    const capa = await CAPA.findById(id);
    if (!capa) return res.status(404).send({ message: "capa not found" });
    const reviewer = await Auth.findById(userId)
      .populate("role", "roleName")
      .populate("department", "departmentName");
    if (!reviewer) return res.status(404).send({ message: "Reviewer not found" });
    if (
      reviewer.department.departmentName !== "QA" &&
      String(reviewer.department._id) !== String(capa.department._id)
    ) {
      return res.status(403).send({
        message:
          "You can only review deviations from your own department (QA can review all).",
      });
    }
    if (reviewer.role.roleName !== "Reviewer") {
      return res.status(403).send({
        message: "Only users with Reviewer role can review this capa.",
      });
    }
    if (capa.status !== "Under Department Head Review") {
      return res.status(400).send({
        message: "Only capa under department head review can be reviewed.",
      });
    }
    let newStatus;
    if (action === "Approved") newStatus = "Approved By Department Head";
    else if (action === "Rejected") newStatus = "Draft";
    else
      return res.status(400).send({
        message: "Invalid action — use 'Approved' or 'Rejected'.",
      });
    capa.status = newStatus;
    capa.reviewedBy = reviewer._id;
    capa.reviewedAt = new Date();
    capa.reviewComments = reviewComments;
    await capa.save();
    return res.status(200).send({
      message: `Capa ${action.toLowerCase()} successfully.`,
      success: true,
      capa,
    });
  } catch (error) {
    console.error("Error reviewing capa:", error);
    return res.status(500).send({
      message: "Error reviewing capa",
      error: error.message,
    });
  }
};

export const qaReviewCapa = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, qaComments } = req.body;
    const capa = await CAPA.findById(id);
    if (!capa) return res.status(404).json({ message: "capa not found" });
    if (capa.status !== "Approved By Department Head") {
      return res.status(400).json({
        message: "Only capa approved by Department Head can be reviewed by QA",
      });
    }
    if (!["Approved", "Rejected"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action. Must be 'Accepted' or 'Rejected'",
      });
    }
    if (action === "Approved") {
      capa.status = "Accepted By QA";
      capa.qaReviewer = req.user._id;
      capa.qaReviewedAt = new Date();
      capa.qaComments = qaComments || null;
    } else if (action === "Rejected") {
      capa.status = "Draft";
      capa.qaReviewer = req.user._id;
      capa.qaReviewedAt = new Date();
      capa.qaComments = qaComments || "Rejected by QA";
    }
    await capa.save();
    res.status(200).json({
      success: true,
      message:
        action === "Accepted"
          ? "capa accepted by QA successfully."
          : "capa rejected by QA.",
      capa,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error reviewing capa by QA",
      error: error.message,
    });
  }
};

export const recordTeamInvestigation = async (req, res) => {
  try {
    const { capaId, correctiveMeasures, correctiveActions, preventiveActions } = req.body;
    const userId = req.user._id;

    if (!capaId)
      return res.status(400).json({ success: false, message: "capaId is required" });

    const capa = await CAPA.findById(capaId);
    if (!capa)
      return res.status(404).json({ success: false, message: "CAPA not found" });

    if (capa.status !== "Root Cause Analysis Done")
      return res.status(400).json({
        success: false,
        message: "Team investigation can only be done after root cause analysis.",
      });

    const team = await CapaInvestigationTeam.findById(capa.investigationTeam);
    if (!team)
      return res.status(404).json({ success: false, message: "Investigation team not found." });

    const isMember = team.members.some(
      (m) => m.user.toString() === userId.toString()
    );

    if (!isMember)
      return res.status(403).json({
        success: false,
        message: "You are not authorized to record investigation for this CAPA.",
      });

    capa.teamCorrectiveMeasures = correctiveMeasures || "";
    capa.teamCorrectiveActions = correctiveActions || "";
    capa.teamPreventiveActions = preventiveActions || "";
    capa.status = "Team Investigation Done";

    await capa.save();

    res.status(200).json({
      success: true,
      message: "Team investigation recorded successfully.",
      data: capa,
    });

  } catch (error) {
    console.error("Error recording team investigation:", error);
    res.status(500).json({
      success: false,
      message: "Server error while recording team investigation.",
      error: error.message,
    });
  }
};

export const recordChangeControlDecision = async (req, res) => {
  try {
    const { capaId, changeControlRequired, justification, immediateActions } = req.body;
    const userId = req.user._id;
    if (!capaId || changeControlRequired === undefined) {
      return res.status(400).json({
        success: false,
        message: "capaId and changeControlRequired are required"
      });
    }
    const capa = await CAPA.findById(capaId);
    if (!capa) {
      return res.status(404).json({ success: false, message: "CAPA not found" });
    }
    if (capa.status !== "Team Investigation Done") {
      return res.status(400).json({
        success: false,
        message: "Change control decision can be recorded only after team investigation is done."
      });
    }
    capa.changeControlRequired = changeControlRequired;
    capa.changeControlDecisionBy = userId;
    if (!changeControlRequired) {
      if (!justification) {
        return res.status(400).json({
          success: false,
          message: "Justification is required when change control is not required."
        });
      }
      capa.changeControlJustification = justification;
      capa.immediateActions = Array.isArray(immediateActions) ? immediateActions : [];
      capa.status = "Immediate Actions In Progress";
      await capa.save();
      return res.status(201).json({
        success: true,
        message: "Change control not required. Immediate actions recorded successfully.",
        data: capa,
      });
    }
    const changeControl = await ChangeControl.create({
      capa: capaId,
      createdBy: userId,
    });
    capa.changeControlReference = changeControl._id;
    capa.status = "Change Control Initiated";
    await capa.save();
    return res.status(201).json({
      success: true,
      message: "Change control created and linked to CAPA successfully.",
      data: changeControl,
    });
  } catch (error) {
    console.error("Error recording change control decision:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

