import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      // required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      // required: true,
    },
    isActivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Auth = mongoose.model("Auth", AuthSchema);

export default Auth;
