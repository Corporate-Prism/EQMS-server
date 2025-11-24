import mongoose from "mongoose";

export const attachmentSchema = new mongoose.Schema({
  deviationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deviation",
    derfault: null
  },
  changeControlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChangeControl",
    default: null,
  },
  attachmentUrl: {
    type: String,
    required: true,
  },
});

const Attachments = mongoose.model("Attachments", attachmentSchema);

export default Attachments;