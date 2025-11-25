import mongoose from "mongoose";
import ChangeControl from "../../models/change-control/ChangeControl.js";
import Attachments from "../../models/deviation/Attachments.js";
import { uploadFilesToCloudinary } from "../../../utils/uploadToCloudinary.js";
import fs from "fs";
import Auth from "../../models/Auth.js";

export const createChangeControl = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const body = req.body;
        const detailedFiles = req.files["detailedDescriptionAttachments"] || [];
        const detailedUrls = await uploadFilesToCloudinary(
            detailedFiles,
            "eqms/change-control/detailed"
        );
        detailedFiles.forEach((file) => {
            try {
                if (file?.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                } else {
                    console.warn("Temp file not found, skipping delete:", file?.path);
                }
            } catch (err) {
                console.error("Failed to delete temp file:", file?.path, err);
            }
        });
        const userId = req.user._id;
        let itemObj;
        try {
            itemObj =
                typeof body.item === "string" ? JSON.parse(body.item) : body.item;
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: "Invalid item format. Must be valid JSON.",
            });
        }
        if (!itemObj?.type) {
            return res.status(400).json({
                success: false,
                message: "item.type is required",
            });
        }
        let itemData = { type: itemObj.type };
        if (itemObj.type === "product") {
            itemData.product = {
                productName: itemObj.productName,
                productCode: itemObj.productCode,
                productBatchNumber: itemObj.productBatchNumber,
            };
        }
        else if (itemObj.type === "product") {
            itemData.product = {
                materialName: itemObj.materialName,
                materialCode: itemObj.materialCode,
                materialBatchNumber: itemObj.materialBatchNumber,
            };
        } else if (itemObj.type === "equipment") {
            itemData.equipment = itemObj.equipment;
        } else {
            return res.status(400).json({
                success: false,
                message: "item.type must be 'product', 'material', or 'equipment'",
            });
        }
        let documents = [];
        if (body.documents) {
            try {
                let parsed =
                    typeof body.documents === "string"
                        ? JSON.parse(body.documents)
                        : body.documents;

                if (!Array.isArray(parsed)) parsed = [parsed];
                documents = parsed
                    .map((d) => {
                        if (typeof d === "string") d = JSON.parse(d);
                        if (!d.documentId || !d.documentModel) return null;

                        return {
                            documentId: d.documentId,
                            documentModel: d.documentModel,
                        };
                    })
                    .filter((x) => x !== null);
            } catch (err) {
                console.error("Documents parsing failed", err);
                documents = [];
            }
        }
        let similarChanges = [];
        if (body.similarChanges) {
            try {
                let parsed = typeof body.similarChanges === "string"
                    ? JSON.parse(body.similarChanges)
                    : body.similarChanges;

                if (!Array.isArray(parsed)) {
                    parsed = [parsed];
                }

                similarChanges = parsed
                    .filter(id => {
                        const valid = mongoose.Types.ObjectId.isValid(id);
                        if (!valid) console.warn("Invalid ObjectId:", id);
                        return valid;
                    })
                    .map(id => ({
                        change: id
                    }));
            } catch (error) {
                console.error("Error parsing similarChanges:", error);
                similarChanges = [];
            }
        }
        const implementationTimeline = {
            startDate: body.startDate || null,
            endDate: body.endDate || null,
        };
        const [createdCC] = await ChangeControl.create(
            [
                {
                    initiatedAt: body.initiatedAt,
                    justification: body.justification,
                    changeType: {
                        type1: body.changeType1,
                        type2: body.changeType2,
                        type3: body.changeType3,
                    },
                    department: body.department,
                    location: body.location,
                    item: itemData,
                    documents,
                    similarChanges,
                    currentSituation: body.currentSituation,
                    shortTitle: body.shortTitle,
                    detailedDescription: {
                        question1: "What change is proposed?",
                        answer1: body.answer1,
                        question2: "Why it is required?",
                        answer2: body.answer2,
                    },
                    immediateImpactAssessment: body.impactAssessment,
                    riskAssessment: body.riskAssessment,
                    implementationTimeline,
                    capa: body.capa || null,
                    createdBy: userId,
                },
            ],
            { session }
        );
        if (detailedUrls.length > 0) {
            const attachmentDocs = await Attachments.insertMany(
                detailedUrls.map((url) => ({
                    attachmentUrl: url,
                    changeControlId: createdCC._id,
                    type: "detailedDescription",
                })),
                { session }
            );
            createdCC.detailedDescription.attachments = attachmentDocs.map(
                (a) => a._id
            );
            await createdCC.save({ session });
        }
        await session.commitTransaction();
        session.endSession();
        return res.status(201).json({
            success: true,
            message: "Change Control created successfully",
            data: createdCC,
        });
    } catch (error) {
        console.error("Error creating Change Control:", error);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
            success: false,
            message: "Error creating Change Control",
            error: error.message,
        });
    }
};

export const getAllChangeControls = async (req, res) => {
    try {
        const changeControls = await ChangeControl.find();
        return res.status(200).json({
            success: true,
            data: changeControls,
        });
    } catch (error) {
        console.error("Error fetching Change Controls:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching Change Controls",
            error: error.message,
        });
    }
}

export const getChangeControlById = async (req, res) => {
    try {
        const { id } = req.params;
        const changeControl = await ChangeControl.findById(id);
        if (!changeControl) return res.status(404).json({ success: false, message: "Change control not found" });
        return res.status(200).json({
            success: true,
            data: changeControl,
        });
    } catch (err) {
        console.error("Error fetching change control by ID:", err);
        res.status(500).json({ success: false, message: "Error fetching change control", error: err.message });
    }
}

export const getChangeControlSummary = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (req.user.department.departmentName !== "QA") query.department = req.user.department._id;
        if (search && search.trim() !== "") {
            query.shortTitle = { $regex: search, $options: "i" };
        }
        const changeControls = await ChangeControl.find(query)
            .select("changeControlNumber shortTitle initiatedAt");
        res.status(200).json({
            success: true,
            changeControls,
        });
    } catch (err) {
        console.error("Error fetching change control summary:", err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const submitChangeControlForReview = async (req, res) => {
    try {
        const { id } = req.params;
        const changeControl = await ChangeControl.findById(id);
        if (!changeControl) return res.status(404).json({ success: false, message: "Change control not found" });
        if (req.user.department.departmentName !== "QA" &&
            String(req.user.department._id) !== String(changeControl.department?._id)) {
            return res.status(403).send({
                message:
                    "You can only submit change control that belong to your own department",
            });
        }
        if (changeControl.status !== "Draft") {
            return res.status(400).send({
                message: "Only draft change control can be submitted for review",
            });
        }
        changeControl.status = "Under Department Head Review";
        changeControl.submittedBy = req.user._id;
        changeControl.submittedAt = new Date();
        await changeControl.save();
        return res.status(200).send({
            message: "change control submitted for review successfully",
            success: true,
            changeControl,
        });
    } catch (error) {
        console.error("Error submitting change control:", error);
        return res.status(500).send({
            message: "Error submitting change control",
            error: error.message,
        });
    }
};

export const reviewChangeControl = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reviewComments } = req.body;
    const userId = req.user._id;
    const changeControl = await ChangeControl.findById(id);
    if (!changeControl) return res.status(404).send({ message: "change control not found" });
    const reviewer = await Auth.findById(userId)
      .populate("role", "roleName")
      .populate("department", "departmentName");
    if (!reviewer) return res.status(404).send({ message: "Reviewer not found" });
    if (
      reviewer.department.departmentName !== "QA" &&
      String(reviewer.department._id) !== String(changeControl.department._id)
    ) {
      return res.status(403).send({
        message:
          "You can only review deviations from your own department (QA can review all).",
      });
    }
    if (reviewer.role.roleName !== "Reviewer") {
      return res.status(403).send({
        message: "Only users with Reviewer role can review this change control.",
      });
    }
    if (changeControl.status !== "Under Department Head Review") {
      return res.status(400).send({
        message: "Only change control under department head review can be reviewed.",
      });
    }
    let newStatus;
    if (action === "Approved") newStatus = "Approved By Department Head";
    else if (action === "Rejected") newStatus = "Draft";
    else
      return res.status(400).send({
        message: "Invalid action — use 'Approved' or 'Rejected'.",
      });
    changeControl.status = newStatus;
    changeControl.reviewedBy = reviewer._id;
    changeControl.reviewedAt = new Date();
    changeControl.reviewComments = reviewComments;
    await changeControl.save();
    return res.status(200).send({
      message: `change control ${action.toLowerCase()} successfully.`,
      success: true,
      changeControl,
    });
  } catch (error) {
    console.error("Error reviewing changeControl:", error);
    return res.status(500).send({
      message: "Error reviewing changeControl",
      error: error.message,
    });
  }
};
