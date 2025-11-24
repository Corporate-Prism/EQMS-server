import ChangeCategory from "../../models/change-control/ChangeCategory.js";


export const addNewChangeCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        if (!categoryName) return res.status(400).json({ message: "All fields are required" });
        const changeCategory = await ChangeCategory.create({
            categoryName
        });
        return res
            .status(201)
            .json({
                message: "Change category created successfully",
                changeCategory: changeCategory,
            });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const getAllChangeCategories = async (req, res) => {
    try {
        const { search } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { categoryName: { $regex: search, $options: "i" } },
            ];
        }
        const changeCategories = await ChangeCategory.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ changeCategories });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const getChangeCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const changeCategory = await ChangeCategory.findById(id);
        if (!changeCategory) return res.status(404).json({ message: "Change category not found" });
        return res.status(200).json({ changeCategory });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const updateChangeCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName } = req.body;
        const changeCategory = await ChangeCategory.findByIdAndUpdate(id, { categoryName }, { new: true, runValidators: true });
        if (!changeCategory) return res.status(404).json({ message: "Change category not found" });
        return res
            .status(200)
            .json({ message: "Change category updated successfully", changeCategory });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const deleteChangeCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const changeCategory = await ChangeCategory.findByIdAndDelete(id);
        if (!changeCategory) return res.status(404).json({ message: "Change category not found" });
        return res.status(200).json({ message: "Change category deleted successfully" });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
}