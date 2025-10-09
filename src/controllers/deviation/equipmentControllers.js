import Equipment from "../../models/deviation/Equipment.js";

export const addNewEquipment = async (req, res) => {
    try {
        const { equipmentName, department } = req.body;
        if (!equipmentName || !department) return res.status(400).json({ message: "All fields are required" });
        const equipment = await Equipment.create({
            equipmentName,
            department,
        });
        return res
            .status(201)
            .json({
                message: "Equipment created successfully",
                equipment: equipment,
            });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const getAllEquipments = async (req, res) => {
    try {
        const { search } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { equipmentName: { $regex: search, $options: "i" } },
                { equipmentCode: { $regex: search, $options: "i" } }
            ];
        }
        const equipments = await Equipment.find(query).populate("department").sort({ createdAt: -1 });
        return res.status(200).json({ equipments });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const getEquipmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await Equipment.findById(id).populate("department");
        if (!equipment) return res.status(404).json({ message: "Equipment not found" });
        return res.status(200).json({ equipment });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const updateEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { equipmentName } = req.body;
        const equipment = await Equipment.findByIdAndUpdate(id, { equipmentName }, { new: true, runValidators: true });
        if (!equipment) return res.status(404).json({ message: "Equipment not found" });
        return res
            .status(200)
            .json({ message: "Equipment updated successfully", equipment });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const deleteEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await Equipment.findByIdAndDelete(id);
        if (!equipment) return res.status(404).json({ message: "Equipment not found" });
        return res.status(200).json({ message: "Equipment deleted successfully" });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};