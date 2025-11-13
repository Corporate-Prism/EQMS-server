import mongoose from "mongoose";
import CAPA from "../../models/capa/Capa.js";
import Deviation from "../../models/deviation/Deviation.js";
import Attachments from "../../models/deviation/Attachments.js";
import { uploadFilesToCloudinary } from "../../../utils/uploadToCloudinary.js";
import fs from "fs";

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
      .populate("createdBy", "username email")
      .populate("relatedRecords.attachments")
      .populate("supportingDocuments.attachments");

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
      .populate("createdBy", "username email")
      .populate("relatedRecords.attachments")
      .populate("supportingDocuments.attachments");

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
    const { search } = req.query;
    let query = {};
    if (req.user.department.departmentName !== "QA") query.department = req.user.department._id;
    if (search && search.trim() !== "") {
      query.reasonForCAPA = { $regex: search, $options: "i" };
    }
    const capas = await CAPA.find(query)
      .select("capaNumber reasonForCAPA initiationDate targetClosureDate");
    res.status(200).json({
      success: true,
      capas,
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
    // const capa = await CAPA.findById(id).populate("department createdBy");
    if(!capa) return res.status(404).send({ message: "capa not found" });
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