import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: true,
      trim: true,
    },
    locationCode: {
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

const Location = mongoose.model("Location", LocationSchema);

export default Location;