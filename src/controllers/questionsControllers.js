import Question from "../models/Question.js";


export const addNewQuestion = async (req, res) => {
    try {
        const { questionText,  } = req.body;
        if (!questionText || !responseType) return res.status(400).json({ message: "All fields are required" });
        const question = await Question.create({
            questionText,
            responseType,
        });
        return res
            .status(201)
            .json({
                message: "Question created successfully",
                question: question,
            });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const getAllQuestions = async (req, res) => {
    try {
        const { search } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { questionText: { $regex: search, $options: "i" } },
            ];
        }
        const questions = await Question.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ questions });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findById(id);
        if (!question) return res.status(404).json({ message: "Question not found" });
        return res.status(200).json({ question });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionText } = req.body;
        const question = await Question.findByIdAndUpdate(id, { questionText }, { new: true, runValidators: true });
        if (!question) return res.status(404).json({ message: "Question not found" });
        return res
            .status(200)
            .json({ message: "Question updated successfully", question });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findByIdAndDelete(id);
        if (!question) return res.status(404).json({ message: "Question not found" });
        return res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};