import ChangeControl from "../../models/change-control/ChangeControl.js";
import ChangeControlInvestigationTeam from "../../models/change-control/ChangeControlInvestigationTeam.js"

export const createChangeControlInvestigationTeam = async (req, res) => {
    try {
        const { changeControlId, members, remarks } = req.body;
        const user = req.user;
        const changeControl = await ChangeControl.findById(changeControlId);
        if (!changeControl) return res.status(404).send({ message: "change control not found" });
        if (changeControl.status !== "Accepted By QA") {
            return res.status(400).send({
                message: "Investigation team can only be created after QA approval.",
            });
        }
        const team = new ChangeControlInvestigationTeam({
            changeControl: changeControl._id,
            members,
            remarks,
            createdBy: user._id,
        });
        await team.save();
        changeControl.investigationTeam = team._id;
        changeControl.investigationAssignedBy = user._id;
        changeControl.status = "Investigation Team Assigned";
        await changeControl.save();
        return res.status(201).send({
            message: "Investigation team created successfully.",
            success: true,
            changeControl,
            team,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error creating investigation team", error: error.message });
    }
};

export const getAllChangeControlInvestigationTeams = async (req, res) => {
    try {
        const teams = await ChangeControlInvestigationTeam.find()
            .populate({
                path: "changeControl",
                select: "changeControlNumber status",
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
        console.error("Error fetching change control investigation teams:", error);
        res.status(500).send({ message: "Error fetching change control investigation teams", error: error.message });
    }
};

export const getChangeControlInvestigationTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        let team = await ChangeControlInvestigationTeam.findById(id)
            .populate({
                path: "changeControl",
                select: "changeControlNumber status department",
                populate: { path: "department", select: "departmentName" },
            })
            .populate({
                path: "members.user",
                select: "name email",
                populate: { path: "role", select: "roleName" },
            })
            .populate("createdBy", "name email");
        if (!team) {
            team = await ChangeControlInvestigationTeam.findOne({ changeControl: id })
                .populate({
                    path: "changeControl",
                    select: "changeControlNumber status department",
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
                .send({ success: false, message: "Investigation team not found for provided ID or change control." });

        res.status(200).send({
            success: true,
            team,
        });
    } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).send({ success: false, message: "Error fetching team", error: error.message });
    }
};


export const updateChangeControlInvestigationTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks, members } = req.body;
        const team = await ChangeControlInvestigationTeam.findById(id);
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

export const deleteChangeControlInvestigationTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await ChangeControlInvestigationTeam.findById(id);
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