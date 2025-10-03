import mongoose from "mongoose";

const WIReviewSchema = new mongoose.Schema(
  {
    wiVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WIVersion",
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
