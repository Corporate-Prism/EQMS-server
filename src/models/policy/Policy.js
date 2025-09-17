import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    policyName: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    deptCode: {
      type: String,
      required: true,
    },
    referrenceNumber: {
      type: String,
      required: true,
    },
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

policySchema.virtual("versions", {
  ref: "PolicyVersion",
  localField: "_id",
  foreignField: "policy",
});

const Policy = mongoose.model("Policy", policySchema);

export default Policy;
