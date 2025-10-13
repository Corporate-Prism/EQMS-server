//not tested yet, will be tested once deviation model is completed

import DeviationImpact from "../models/DeviationImpact.js";
import Question from "../../models/Question.js";

// ✅ Create new deviation impact record
export const addDeviationImpact = async (req, res) => {
  try {
    const { deviationId, answers } = req.body;

    if (!deviationId || !answers || !Array.isArray(answers) || answers.length === 0)
      return res.status(400).json({ message: "Deviation ID and answers are required" });

    // ✅ Optional backend validation (to ensure correct answer type)
    for (const ans of answers) {
      const question = await Question.findById(ans.questionId);
      if (!question) return res.status(400).json({ message: `Invalid questionId: ${ans.questionId}` });

      if (question.responseType === "rating") {
        if (typeof ans.answer !== "number" || ans.answer < 1 || ans.answer > 5)
          return res.status(400).json({
            message: `Invalid rating for question "${question.questionText}". Must be a number between 1 and 5.`,
          });
      } else if (question.responseType === "yes_no") {
        if (typeof ans.answer !== "boolean")
          return res.status(400).json({
            message: `Invalid yes/no answer for question "${question.questionText}". Must be true or false.`,
          });
      }
    }

    const deviationImpact = await DeviationImpact.create({ deviationId, answers });

    return res.status(201).json({
      message: "Deviation impact assessment created successfully",
      deviationImpact,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// ✅ Get all deviation impact assessments
export const getAllDeviationImpacts = async (req, res) => {
  try {
    const impacts = await DeviationImpact.find()
      .populate("deviationId", "deviationId")
      .populate("answers.questionId", "questionText responseType")
      .sort({ createdAt: -1 });

    return res.status(200).json({ impacts });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// ✅ Get a single deviation impact by ID
export const getDeviationImpactById = async (req, res) => {
  try {
    const { id } = req.params;
    const impact = await DeviationImpact.findById(id)
      .populate("deviationId", "deviationId")
      .populate("answers.questionId", "questionText responseType");

    if (!impact) return res.status(404).json({ message: "Deviation impact not found" });

    return res.status(200).json({ impact });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// ✅ Update deviation impact record
export const updateDeviationImpact = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const updatedImpact = await DeviationImpact.findByIdAndUpdate(
      id,
      { answers },
      { new: true, runValidators: true }
    )
      .populate("deviationId", "deviationId")
      .populate("answers.questionId", "questionText responseType");

    if (!updatedImpact) return res.status(404).json({ message: "Deviation impact not found" });

    return res.status(200).json({
      message: "Deviation impact assessment updated successfully",
      deviationImpact: updatedImpact,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// ✅ Delete deviation impact record
export const deleteDeviationImpact = async (req, res) => {
  try {
    const { id } = req.params;
    const impact = await DeviationImpact.findByIdAndDelete(id);

    if (!impact) return res.status(404).json({ message: "Deviation impact not found" });

    return res.status(200).json({ message: "Deviation impact assessment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};
