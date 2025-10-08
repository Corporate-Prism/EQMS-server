import DeviationCategory from "../../models/deviation/DeviationCategory.js";

export const addNewDeviationCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        if (!categoryName) return res.status(400).json({ message: "All fields are required" });
        const deviationCategory = await DeviationCategory.create({
            categoryName
        });
        return res
            .status(201)
            .json({
                message: "Deviation category created successfully",
                deviationCategory: deviationCategory,
            });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const getAllDeviationCategories = async (req, res) => {
    try {
        const { search } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { categoryName: { $regex: search, $options: "i" } },
            ];
        }
        const deviationCategories = await DeviationCategory.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ deviationCategories });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const getDeviationCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const deviationCategory = await DeviationCategory.findById(id);
        if (!deviationCategory) return res.status(404).json({ message: "Deviation category not found" });
        return res.status(200).json({ deviationCategory });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const updateDeviationCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName } = req.body;
        const deviationCategory = await DeviationCategory.findByIdAndUpdate(id, { categoryName }, { new: true, runValidators: true });
        if (!deviationCategory) return res.status(404).json({ message: "Deviation category not found" });
        return res
            .status(200)
            .json({ message: "Deviation category updated successfully", deviationCategory });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const deleteDeviationCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deviationCategory = await DeviationCategory.findByIdAndDelete(id);
        if (!deviationCategory) return res.status(404).json({ message: "Deviation category not found" });
        return res.status(200).json({ message: "Deviation category deleted successfully" });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
}