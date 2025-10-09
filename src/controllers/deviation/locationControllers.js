import Location from "../../models/deviation/Location.js";

export const addNewLocation = async (req, res) => {
    try {
        const { locationName,  department} = req.body;
        if (!locationName || !department) return res.status(400).json({ message: "All fields are required" });
        const location = await Location.create({
            locationName,
            department,
        });
        return res
            .status(201)
            .json({
                message: "Location created successfully",
                location: location,
            });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const getAllLocations = async (req, res) => {
    try {
        const { search } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { locationName: { $regex: search, $options: "i" } },
                { locationCode: { $regex: search, $options: "i" } }
            ];
        }
        const locations = await Location.find(query).populate("department").sort({ createdAt: -1 });
        return res.status(200).json({ locations });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await Location.findById(id).populate("department");
        if (!location) return res.status(404).json({ message: "Location not found" });
        return res.status(200).json({ location });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { locationName } = req.body;
        const location = await Location.findByIdAndUpdate(id, { locationName }, { new: true, runValidators: true });
        if (!location) return res.status(404).json({ message: "Location not found" });
        return res
            .status(200)
            .json({ message: "Location updated successfully", location });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};

export const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await Location.findByIdAndDelete(id);
        if (!location) return res.status(404).json({ message: "Location not found" });
        return res.status(200).json({ message: "Location deleted successfully" });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
};