import mongoose from "mongoose";

const policyReviewSchema = new mongoose.Schema(
  {
    policyVersion: {
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

const PolicyReview = mongoose.model("PolicyReview", policyReviewSchema);

export default PolicyReview;
