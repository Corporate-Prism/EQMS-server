import mongoose from "mongoose";

const workInstructionSchema = new mongoose.Schema(
  {
    workInstructionName: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
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

workInstructionSchema.virtual("versions", {
  ref: "WIVersion",
  localField: "_id",
  foreignField: "workInstruction",
});

const WorkInstruction = mongoose.model(
  "WorkInstruction",
  workInstructionSchema
);

export default WorkInstruction;
