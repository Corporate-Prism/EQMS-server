import mongoose from "mongoose";

const procedureVersionSchema = new mongoose.Schema(
  {
    procedure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Procedure",
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
    purpose: {
      type: String,
      required: true,
    },
    scope: {
      type: String,
      required: true,
    },
    procedures: {
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
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      // required: true,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "under_review",
        "under_approval",
        "approved",
        "archieved",
      ],
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

procedureVersionSchema.virtual("reviews", {
  ref: "ProcedureReview",
  localField: "_id",
  foreignField: "procedureVersion",
});

procedureVersionSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // only for new versions

  // Find the latest version of this procedure
  const lastVersion = await mongoose
    .model("ProcedureVersion")
    .findOne({ procedure: this.procedure })
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

const ProcedureVersion = mongoose.model(
  "ProcedureVersion",
  procedureVersionSchema
);

export default ProcedureVersion;
