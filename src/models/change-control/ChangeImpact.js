import mongoose from "mongoose";

const ChangeImpactSchema = new mongoose.Schema(
    {
        changeControlId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChangeControl",
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

const ChangeImpact = mongoose.model("ChangeImpact", ChangeImpactSchema);
export default ChangeImpact;