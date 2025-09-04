import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema(
  {
    permissionName: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Permission = mongoose.model("Permission", PermissionSchema);

export default Permission;
