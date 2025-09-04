import mongoose from "mongoose";

const versionSchema = new mongoose.Schema(
  {
    versionType: {
      type: String,
      enum: ["minor", "major"],
      default: "minor",
    },
    versionNumber: {
      type: String,
      required: true,
    },
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    preparedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    // reviews: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Review",
    //     required: true,
    //   },
    // ],
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "under_review", "approved"],
      default: "draft",
    },
  },
  { timestamps: true }
);

versionSchema.virtual("Review", {
  ref: "Review",
  localField: "_id",
  foreignField: "review",
});

const Version = mongoose.model("Version", versionSchema);

export default Version;
