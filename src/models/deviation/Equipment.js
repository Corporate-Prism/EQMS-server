import mongoose from "mongoose";

const EquipmentSchema = new mongoose.Schema(
  {
    equipmentName: {
      type: String,
      required: true,
      trim: true,
    },
    equipmentCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    }
  },
  { timestamps: true }
);

const Equipment = mongoose.model("Equipment", EquipmentSchema);

export default Equipment;