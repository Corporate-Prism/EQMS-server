import mongoose from "mongoose";

const investigationTeamSchema = new mongoose.Schema({
  capa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CAPA",
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

export default mongoose.model("CapaInvestigationTeam", investigationTeamSchema);
