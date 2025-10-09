import mongoose from "mongoose";
import Department from "../Department.js";

const locationSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    locationCode: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

locationSchema.pre("save", async function (next) {
  if (this.locationCode) return next();
  try {
    const department = await Department.findById(this.department);
    if (!department) throw new Error("Department not found");
    const prefix = department.departmentName.substring(0, 3).toUpperCase();
    const count = await mongoose.model("Location").countDocuments({ department: this.department });
    this.locationCode = `${prefix}-LOC${String(count + 1).padStart(3, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Location = mongoose.model("Location", locationSchema);
export default Location;