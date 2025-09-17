import mongoose from "mongoose";

const procedureReviewSchema = new mongoose.Schema(
  {
    procedureVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PolicyVersion",
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    comments: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ProcedureReview = mongoose.model(
  "ProcedureReview",
  procedureReviewSchema
);

export default ProcedureReview;
