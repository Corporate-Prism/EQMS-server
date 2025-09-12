import mongoose from "mongoose";

const manualReviewSchema = new mongoose.Schema(
  {
    manualVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManualVersion",
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

const ManualReview = mongoose.model("ManualReview", manualReviewSchema);

export default ManualReview;
