import mongoose from "mongoose";

const manualSchema = new mongoose.Schema(
  {
    manualName: {
      type: String, // <-- you missed "type:" here
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

manualSchema.virtual("versions", {
  ref: "ManualVersion",
  localField: "_id",
  foreignField: "manual",
});

const Manual = mongoose.model("Manual", manualSchema);

export default Manual;
