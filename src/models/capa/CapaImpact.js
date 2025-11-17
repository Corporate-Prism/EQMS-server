import mongoose from "mongoose";

const CapaImpactSchema = new mongoose.Schema(
    {
        capaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CAPA",
            required: true,
        },
        answers: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true,
                },
                answer: {
                    type: mongoose.Schema.Types.Mixed,
                    required: true,
                },
                comment: {
                    type: String,
                    trim: true,
                },
            },
        ]
    },
    { timestamps: true }
);

const CapaImpact = mongoose.model("CapaImpact", CapaImpactSchema);
export default CapaImpact;