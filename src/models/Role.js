import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
    },
    // permissions: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Permission",
    //     // required: true,
    //   },
    // ],
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", RoleSchema);

export default Role;
