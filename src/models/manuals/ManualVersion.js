// import mongoose from "mongoose";

// const manualVersionSchema = new mongoose.Schema(
//   {
//     versionType: {
//       type: String,
//       enum: ["minor", "major"],
//       default: "minor",
//     },
//     versionNumber: {
//       type: String,
//       required: true,
//     },
//     intruduction: {
//       type: String,
//       required: true,
//     },
//     objective: {
//       type: String,
//       required: true,
//     },
//     purpose: {
//       type: String,
//       required: true,
//     },
//     scope: {
//       type: String,
//       required: true,
//     },
//     policyStatement: {
//       type: String,
//       required: true,
//     },
//     organizationalStructure: {
//       type: String,
//       required: true,
//     },
//     effectiveDate: {
//       type: Date,
//       required: true,
//       default: Date.now(),
//     },
//     preparedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Auth",
//       required: true,
//     },
//     // reviews: [
//     //   {
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: "Review",
//     //     required: true,
//     //   },
//     // ],
//     approvedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Auth",
//       required: true,
//     },
//     nextReviewDate: {
//       type: Date,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["draft", "under_review", "approved"],
//       default: "draft",
//     },
//   },
//   { timestamps: true }
// );

// versionSchema.virtual("Review", {
//   ref: "Review",
//   localField: "_id",
//   foreignField: "review",
// });

// const ManualVersion = mongoose.model("ManualVersion", manualVersionSchema);

// export default ManualVersion;

import mongoose from "mongoose";

const manualVersionSchema = new mongoose.Schema(
  {
    manual: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manual",
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
    introduction: {
      type: String,
      required: true,
    },
    objective: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    scope: {
      type: String,
      required: true,
    },
    policyStatement: {
      type: String,
      required: true,
    },
    organizationalStructure: {
      type: String,
      required: true,
    },
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    preparedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      //   required: true,
    },
    nextReviewDate: {
      type: Date,
      //   required: true,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: false,
  }
);

manualVersionSchema.virtual("reviews", {
  ref: "ManualReview",
  localField: "_id",
  foreignField: "manualVersion",
});

manualVersionSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // only for new versions

  // Find the latest version of this manual
  const lastVersion = await mongoose
    .model("ManualVersion")
    .findOne({ manual: this.manual })
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

const ManualVersion = mongoose.model("ManualVersion", manualVersionSchema);

export default ManualVersion;
