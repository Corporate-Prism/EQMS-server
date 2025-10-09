import mongoose from "mongoose";
const QuestionSchema = new mongoose.Schema(
    {
        questionText: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        responseType: {
            type: String,
            enum: ["yes_no", "rating"],
            required: true,
        },
    },
    { timestamps: true }
);
const Question = mongoose.model("Question", QuestionSchema);
export default Question;