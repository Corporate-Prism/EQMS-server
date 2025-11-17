import mongoose from "mongoose";

const CAPASchema = new mongoose.Schema(
  {
    capaNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    initiationDate: {
      type: Date,
    },
    targetClosureDate: {
      type: Date,
    },
    reasonForCAPA: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Under Department Head Review",
        "Approved By Department Head",
        "Accepted By QA",
        "Investigation Team Assigned",
        "Root Cause Analysis Done",
        "Team Investigation Done"
      ],
      default: "Draft"
    },
    relatedRecords: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deviation",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    immediateCorrectionTaken: {
      type: String,
      trim: true,
    },
    investigationAndRootCause: {
      type: String,
      trim: true,
    },
    correctiveActions: {
      type: String,
      trim: true,
    },
    preventiveActions: {
      type: String,
      trim: true,
    },
    supportingDocuments: {
      attachments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attachments",
        },
      ],
    },
    deviation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deviation",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      default: null
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    reviewedAt: { type: Date },
    reviewComments: { type: String },
    qaReviewer: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    qaReviewedAt: { type: Date },
    qaComments: { type: String },
    investigationTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CapaInvestigationTeam",
      default: null
    },
    investigationAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    },
    rootCauseAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeviationImpact",
      default: null,
    },
    teamCorrectiveMeasures: {
      type: String,
      trim: true,
    },
    teamCorrectiveActions: {
      type: String,
      trim: true,
    },
    teamPreventiveActions: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

CAPASchema.pre("validate", async function (next) {
  if (this.capaNumber) return next();

  try {
    const Deviation = mongoose.model("Deviation");
    const deviation = await Deviation.findById(this.deviation);

    if (!deviation) throw new Error("Deviation not found");
    const count = await mongoose.model("CAPA").countDocuments({
      deviation: this.deviation,
    });
    this.capaNumber = `${deviation.deviationNumber}-CAPA${String(count + 1).padStart(2, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

const CAPA = mongoose.model("CAPA", CAPASchema);
export default CAPA;