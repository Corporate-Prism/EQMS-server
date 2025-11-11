import mongoose from "mongoose";

const CAPASchema = new mongoose.Schema(
  {
    capaNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    deviation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deviation",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
  },
  { timestamps: true }
);

CAPASchema.pre("validate", async function (next) {
  if (this.capaNumber) return next();

  try {
    const Deviation = mongoose.model("Deviation");
    const deviation = await Deviation.findById(this.deviation);

    if (!deviation) throw new Error("Deviation not found");
    const count = await mongoose.model("CAPA").countDocuments({
      deviation: this.deviation,
    });
    this.capaNumber = `${deviation.deviationNumber}-CAPA${String(count + 1).padStart(2, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

const CAPA = mongoose.model("CAPA", CAPASchema);
export default CAPA;
