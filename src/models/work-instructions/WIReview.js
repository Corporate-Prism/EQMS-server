import mongoose from "mongoose";

const WIReviewSchema = new mongoose.Schema(
  {
    WIVersion: {
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

const WIReview = mongoose.model("WIReview", WIReviewSchema);

export default WIReview;
