import CAPA from "../../models/capa/Capa.js";
import CapaInvestigationTeam from "../../models/capa/CapaInvestigationTeam.js";

export const createCapaInvestigationTeam = async (req, res) => {
    try {
        const { capaId, members, remarks } = req.body;
        const user = req.user;

        const capa = await CAPA.findById(capaId);
        console.log("thiis is capa", capa)
        if (!capa) return res.status(404).send({ message: "capa not found" });
        if (capa.status !== "Accepted By QA") {
            return res.status(400).send({
                message: "Investigation team can only be created after QA approval.",
            });
        }
        const team = new CapaInvestigationTeam({
            capa: capa._id,
            members,
            remarks,
            createdBy: user._id,
        });
        await team.save();
        capa.investigationTeam = team._id;
        capa.investigationAssignedBy = user._id;
        capa.status = "Investigation Team Assigned";
        await capa.save();
        return res.status(201).send({
            message: "Investigation team created successfully.",
            success: true,
            capa,
            team,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error creating investigation team", error: error.message });
    }
};

export const getAllCapaInvestigationTeams = async (req, res) => {
    try {
        const teams = await CapaInvestigationTeam.find()
            .populate({
                path: "capa",
                select: "capaNumber status",
            })
            .populate({
                path: "members.user",
                select: "name email",
                populate: { path: "role", select: "roleName" },
            })
            .populate("createdBy", "name email");

        res.status(200).send({
            success: true,
            count: teams.length,
            teams,
        });
    } catch (error) {
        console.error("Error fetching capa investigation teams:", error);
        res.status(500).send({ message: "Error fetching capa investigation teams", error: error.message });
    }
};

export const getCapaInvestigationTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        let team = await CapaInvestigationTeam.findById(id)
            .populate({
                path: "capa",
                select: "capaNumber status department",
                populate: { path: "department", select: "departmentName" },
            })
            .populate({
                path: "members.user",
                select: "name email",
                populate: { path: "role", select: "roleName" },
            })
            .populate("createdBy", "name email");
        if (!team) {
            team = await CapaInvestigationTeam.findOne({ capa: id })
                .populate({
                    path: "capa",
                    select: "capaNumber status department",
                    populate: { path: "department", select: "departmentName" },
                })
                .populate({
                    path: "members.user",
                    select: "name email",
                    populate: { path: "role", select: "roleName" },
                })
                .populate("createdBy", "name email");
        }
        if (!team)
            return res
                .status(404)
                .send({ success: false, message: "Investigation team not found for provided ID or capa." });

        res.status(200).send({
            success: true,
            team,
        });
    } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).send({ success: false, message: "Error fetching team", error: error.message });
    }
};


export const updateCapaInvestigationTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks, members } = req.body;
        const team = await CapaInvestigationTeam.findById(id);
        if (!team) return res.status(404).send({ message: "Investigation team not found" });

        if (remarks) team.remarks = remarks;
        if (members) team.members = members;
        team.updatedAt = new Date();
        await team.save();

        res.status(200).send({
            success: true,
            message: "Investigation team updated successfully.",
            team,
        });
    } catch (error) {
        console.error("Error updating investigation team:", error);
        res.status(500).send({ message: "Error updating investigation team", error: error.message });
    }
};

export const deleteCapaInvestigationTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await CapaInvestigationTeam.findById(id);
        if (!team) return res.status(404).send({ message: "Investigation team not found" });

        await team.deleteOne();
        res.status(200).send({
            success: true,
            message: "Investigation team deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting team:", error);
        res.status(500).send({ message: "Error deleting investigation team", error: error.message });
    }
};