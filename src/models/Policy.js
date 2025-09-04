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

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },

  { timestamps: true }
);

PolicySchema.virtual("Version", {
  ref: "Version",
  localField: "_id",
  foreignField: "policy",
});

const Policy = mongoose.model("Policy", PolicySchema);

export default Policy;
