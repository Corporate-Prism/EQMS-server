import mongoose from "mongoose";

const policyVersionSchema = new mongoose.Schema(
  {
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    versionType: {
      type: String,
      enum: ["minor", "major"],
      default: "minor",
    },
    versionNumber: {
      type: String,
      required: true,
      default: "1.0", // first version
    },
    objective: {
      type: String,
      required: true,
    },
    scope: {
      type: String,
      required: true,
    },
    policies: {
      type: String,
      required: true,
    },
    abbrevations: {
      type: String,
      required: true,
    },
    responsibilities: {
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
      // required: true,
    },
    status: {
      type: String,
      enum: ["draft", "under_review", "under_approval", "approved", "archived"],
      default: "draft",
    },
    nextReviewDate: {
      type: Date,
      // required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: false,
  }
);

policyVersionSchema.virtual("reviews", {
  ref: "PolicyReview",
  localField: "_id",
  foreignField: "policyVersion",
});

policyVersionSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // only for new versions

  // Find the latest version of this policy
  const lastVersion = await mongoose
    .model("PolicyVersion")
    .findOne({ policy: this.policy })
    .sort({ createdAt: -1 });

  if (!lastVersion) return next(); // first version stays default

  let [major, minor] = lastVersion.versionNumber.split(".").map(Number);

  if (this.versionType === "minor") {
    minor += 1;
  } else if (this.versionType === "major") {
    major += 1;
    minor = 0;
  }

  this.versionNumber = `${major}.${minor}`;
  next();
});

const PolicyVersion = mongoose.model("PolicyVersion", policyVersionSchema);

export default PolicyVersion;
