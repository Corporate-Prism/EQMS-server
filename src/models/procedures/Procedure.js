import mongoose from "mongoose";

const procedureSchema = new mongoose.Schema(
  {
    procedureName: {
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

procedureSchema.virtual("versions", {
  ref: "procedureVersion",
  localField: "_id",
  foreignField: "procedure",
});

const Procedure = mongoose.model("Procedure", procedureSchema);

export default Procedure;
