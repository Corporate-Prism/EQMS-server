import mongoose from "mongoose";

const investigationTeamSchema = new mongoose.Schema({
  changeControl: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChangeControl",
    required: true,
  },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
  createdAt: { type: Date, default: Date.now },
  remarks: { type: String, trim: true },
}, { timestamps: true });

export default mongoose.model("ChangeControlInvestigationTeam", investigationTeamSchema);
