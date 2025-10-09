import mongoose from "mongoose";
import Department from "../Department.js";

const equipmentSchema = new mongoose.Schema(
  {
    equipmentName: {
      type: String,
      required: true,
      trim: true,
    },
    equipmentCode: {
      type: String,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    }
  },
  { timestamps: true }
);

equipmentSchema.pre("save", async function (next) {
  if (this.equipmentCode) return next();
  try {
    const department = await Department.findById(this.department);
    if (!department) throw new Error("Department not found");
    const prefix = department.departmentName.substring(0, 3).toUpperCase();
    const count = await mongoose.model("Equipment").countDocuments({ department: this.department });
    this.equipmentCode = `${prefix}-EQU${String(count + 1).padStart(3, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Equipment = mongoose.model("Equipment", equipmentSchema);
export default Equipment;