import mongoose from "mongoose";
import Deviation from "../../models/deviation/Deviation.js";
import Attachments from "../../models/deviation/Attachments.js";
import Auth from "../../models/Auth.js";
import DeviationImpact from "../../models/deviation/DeviationImpact.js";
import { uploadFilesToCloudinary } from "../../../utils/uploadToCloudinary.js";
import CAPA from "../../models/capa/Capa.js";

export const createDeviation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = req.body;
    const impactAssessments = body.impactAssessments
      ? JSON.parse(body.impactAssessments)
      : [];

    const detailedFiles = req.files["detailedDescriptionAttachments"] || [];
    const relatedFiles = req.files["relatedRecordsAttachments"] || [];

    const detailedUrls = await uploadFilesToCloudinary(detailedFiles, "eqms/deviation/detailed");
    const relatedUrls = await uploadFilesToCloudinary(relatedFiles, "eqms/deviation/related");

    const deviation = await Deviation.create(
      [
        {
          reportedAt: body.reportedAt,
          deviationType: {
            type1: body.deviationType1,
            type2: body.deviationType2,
            type3: body.deviationType3,
          },
          department: body.department,
          location: body.location,
          item: {
            type: body.itemType,
            ...(body.itemType === "product"
              ? {
                product: {
                  productName: body.productName,
                  productCode: body.productCode,
                  productBatchNumber: body.productBatchNumber,
                },
              }
              : {
                material: {
                  materialName: body.materialName,
                  materialCode: body.materialCode,
                  materialBatchNumber: body.materialBatchNumber,
                },
              }),
          },
          equipment: body.equipment,
          document: {
            documentId: body.documentId,
            documentModel: body.documentModel,
          },
          summary: body.summary,
          detailedDescription: {
            question1: body.question1,
            answer1: body.answer1,
            question2: body.question2,
            answer2: body.answer2,
          },
          immediateMeasuresTaken: body.immediateMeasuresTaken,
          immediateImpactAssessment: body.immediateImpactAssessment,
          riskAssessment: body.riskAssessment,
          securityLevel: body.securityLevel,
          createdBy: req.user._id
        },
      ],
      { session }
    );

    const createdDeviation = deviation[0];
    const detailedAttachments = await Attachments.insertMany(
      detailedUrls.map((url) => ({
        attachmentUrl: url,
        deviationId: createdDeviation._id,
        type: "detailedDescription",
      })),
      { session }
    );

    const relatedAttachments = await Attachments.insertMany(
      relatedUrls.map((url) => ({
        attachmentUrl: url,
        deviationId: createdDeviation._id,
        type: "relatedRecords",
      })),
      { session }
    );

    createdDeviation.detailedDescription.attachments = detailedAttachments.map((a) => a._id);
    createdDeviation.relatedRecords = {
      attachments: relatedAttachments.map((a) => a._id),
    };

    let deviationImpactDoc = null;
    if (impactAssessments.length > 0) {
      const [createdImpact] = await DeviationImpact.create(
        [
          {
            deviationId: createdDeviation._id,
            answers: impactAssessments.map((ia) => ({
              questionId: ia.questionId,
              answer: ia.answer,
              comment: ia.comment,
            })),
          },
        ],
        { session }
      );

      deviationImpactDoc = createdImpact;
      createdDeviation.impactAssessment = createdImpact._id;
    }

    await createdDeviation.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Deviation created successfully with single impact assessment and attachments",
      deviation: {
        ...createdDeviation.toObject(),
        impactAssessment: deviationImpactDoc,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating deviation:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getDeviations = async (req, res) => {
  try {
    const deviations = await Deviation.find()
      .populate("department", "departmentName")
      .populate("location", "locationName locationCode")
      .populate("equipment", "equipmentName equipmentCode")
      .populate("deviationType.type3", "categoryName")
      .populate("document.documentId", "manualName policyName procedureName workInstructionName")
      .populate("detailedDescription.attachments", "deviationId attachmentUrl")
      .populate("relatedRecords.attachments", "deviationId attachmentUrl")
      .populate("createdBy", "name")
      .populate("submittedBy", "name")
      .populate("reviewedBy", "name")
      .populate("qaReviewer", "name")
      .populate("investigationAssignedBy", "name")
      .populate("historicalCheckedBy", "name")
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
        path: "impactAssessment",
        populate: {
          path: "answers.questionId",
          select: "questionText responseType",
        },
      })
      .populate({
        path: "teamImpactAssessment",
        populate: {
          path: "answers.questionId",
          select: "questionText responseType",
        }
      })
      .populate({
        path: "rootCauseAnalysis",
        populate: {
          path: "answers.questionId",
          select: "questionText responseType",
        }
      })
      .populate({
        path: "similarDeviations",
        populate: {
          path: "deviation",
          select: "deviationNumber",
        }
      })
    res.status(200).json({
      success: true,
      deviations
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export const getDeviationsSummary = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {}
    if (req.user.department.departmentName !== "QA") {
      query = { department: req.user.department._id }
    }
    if (search && search.trim() !== "") query.summary = { $regex: search, $options: "i" };
    const deviations = await Deviation.find(query)
      .select("summary deviationNumber")
    res.status(200).json({
      success: true,
      deviations
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export const getDeviationById = async (req, res) => {
  try {
    const { id } = req.params;

    const deviation = await Deviation.findById(id)
      .populate("department", "departmentName")
      .populate("location", "locationName locationCode")
      .populate("equipment", "equipmentName equipmentCode")
      .populate("deviationType.type3", "categoryName")
      .populate("document.documentId", "manualName policyName procedureName workInstructionName")
      .populate("detailedDescription.attachments", "deviationId attachmentUrl")
      .populate("relatedRecords.attachments", "deviationId attachmentUrl")
      .populate("createdBy", "name")
      .populate("submittedBy", "name")
      .populate("reviewedBy", "name")
      .populate("qaReviewer", "name")
      .populate("investigationAssignedBy", "name")
      .populate("historicalCheckedBy", "name")
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
        path: "impactAssessment",
        populate: {
          path: "answers.questionId",
          select: "questionText responseType",
        },
      })
      .populate({
        path: "teamImpactAssessment",
        populate: {
          path: "answers.questionId",
          select: "questionText responseType",
        }
      })
      .populate({
        path: "rootCauseAnalysis",
        populate: {
          path: "answers.questionId",
          select: "questionText responseType",
        }
      })
      .populate({
        path: "similarDeviations",
        populate: {
          path: "deviation",
          select: "deviationNumber",
        }
      })
      .populate({
        path: "immediateActions",
        populate: {
          path: "assignedTo",
          select: "name"
        }
      })

    if (!deviation) {
      return res.status(404).json({
        success: false,
        message: "Deviation not found",
      });
    }

    res.status(200).json({
      success: true,
      deviation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const submitDeviationForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deviation = await Deviation.findById(id).populate("department createdBy");
    if (!deviation) return res.status(404).send({ message: "Deviation not found" });
    if (req.user.department.departmentName !== "QA" &&
      String(req.user.department._id) !== String(deviation.department?._id)) {
      return res.status(403).send({
        message:
          "You can only submit deviations that belong to your own department",
      });
    }
    if (deviation.status !== "Draft") {
      return res.status(400).send({
        message: "Only draft deviations can be submitted for review",
      });
    }
    deviation.status = "Under Department Head Review";
    deviation.submittedBy = req.user._id;
    deviation.submittedAt = new Date();
    await deviation.save();
    return res.status(200).send({
      message: "Deviation submitted for review successfully",
      success: true,
      deviation,
    });
  } catch (error) {
    console.error("Error submitting deviation:", error);
    return res.status(500).send({
      message: "Error submitting deviation",
      error: error.message,
    });
  }
};

export const reviewDeviation = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reviewComments } = req.body;
    const userId = req.user._id;
    const deviation = await Deviation.findById(id).populate("department createdBy");
    if (!deviation) return res.status(404).send({ message: "Deviation not found" });
    const reviewer = await Auth.findById(userId)
      .populate("role", "roleName")
      .populate("department", "departmentName");
    if (!reviewer) return res.status(404).send({ message: "Reviewer not found" });
    if (
      reviewer.department.departmentName !== "QA" &&
      String(reviewer.department._id) !== String(deviation.department._id)
    ) {
      return res.status(403).send({
        message:
          "You can only review deviations from your own department (QA can review all).",
      });
    }
    if (reviewer.role.roleName !== "Reviewer") {
      return res.status(403).send({
        message: "Only users with Reviewer role can review this deviation.",
      });
    }
    if (deviation.status !== "Under Department Head Review") {
      return res.status(400).send({
        message: "Only deviations under department head review can be reviewed.",
      });
    }
    let newStatus;
    if (action === "Approved") newStatus = "Approved By Department Head";
    else if (action === "Rejected") newStatus = "Draft";
    else
      return res.status(400).send({
        message: "Invalid action — use 'Approved' or 'Rejected'.",
      });
    deviation.status = newStatus;
    deviation.reviewedBy = reviewer._id;
    deviation.reviewedAt = new Date();
    deviation.reviewComments = reviewComments;
    await deviation.save();
    return res.status(200).send({
      message: `Deviation ${action.toLowerCase()} successfully.`,
      success: true,
      deviation,
    });
  } catch (error) {
    console.error("Error reviewing deviation:", error);
    return res.status(500).send({
      message: "Error reviewing deviation",
      error: error.message,
    });
  }
};

export const qaReviewDeviation = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, qaComments } = req.body;
    const deviation = await Deviation.findById(id);
    if (!deviation) return res.status(404).json({ message: "Deviation not found" });
    if (deviation.status !== "Approved By Department Head") {
      return res.status(400).json({
        message: "Only deviations approved by Department Head can be reviewed by QA",
      });
    }
    if (!["Approved", "Rejected"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action. Must be 'Accepted' or 'Rejected'",
      });
    }
    if (action === "Approved") {
      deviation.status = "Accepted By QA";
      deviation.qaReviewer = req.user._id;
      deviation.qaReviewedAt = new Date();
      deviation.qaComments = qaComments || null;
    } else if (action === "Rejected") {
      deviation.status = "Draft";
      deviation.qaReviewer = req.user._id;
      deviation.qaReviewedAt = new Date();
      deviation.qaComments = qaComments || "Rejected by QA";
    }
    await deviation.save();
    res.status(200).json({
      success: true,
      message:
        action === "Accepted"
          ? "Deviation accepted by QA successfully."
          : "Deviation rejected by QA.",
      deviation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error reviewing deviation by QA",
      error: error.message,
    });
  }
};

export const recordCapaDecision = async (req, res) => {
  try {
    const { deviationId, capaRequired, justification, immediateActions } = req.body;
    const userId = req.user._id;

    if (deviationId === undefined || capaRequired === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "deviationId and capaRequired are required." });
    }

    const deviation = await Deviation.findById(deviationId);
    if (!deviation) return res.status(404).json({ success: false, message: "Deviation not found." });

    if (deviation.status !== "Historical Check Done") {
      return res
        .status(400)
        .json({ success: false, message: "CAPA decision can only be recorded after historical check." });
    }

    deviation.capaRequired = capaRequired;
    deviation.capaDecisionBy = userId;

    if (!capaRequired) {
      if (!justification) {
        return res
          .status(400)
          .json({ success: false, message: "Justification is required when CAPA is not required." });
      }

      deviation.capaJustification = justification;
      deviation.immediateActions = immediateActions || [];
      deviation.status = "Immediate Actions In Progress";
      await deviation.save();

      return res.status(201).json({
        success: true,
        message: "CAPA not required. Immediate actions recorded successfully.",
        data: deviation,
      });
    }

    if (capaRequired) {
      const capa = await CAPA.create({
        deviation: deviationId,
        createdBy: userId,
      });

      deviation.capaReference = capa._id;
      deviation.status = "CAPA Initiated";
      await deviation.save();

      return res.status(201).json({
        success: true,
        message: "CAPA created and linked to deviation successfully.",
        data: capa,
      });
    }
  } catch (error) {
    console.error("Error recording CAPA decision:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};