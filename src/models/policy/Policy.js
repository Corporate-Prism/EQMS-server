import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema(
  {
    // version: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Version",
    //     required: true,
    //   },
    // ],
    policyName: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

PolicySchema.virtual("versions", {
  ref: "PolicyVersion",
  localField: "_id",
  foreignField: "policy",
});

const Policy = mongoose.model("Policy", PolicySchema);

export default Policy;
