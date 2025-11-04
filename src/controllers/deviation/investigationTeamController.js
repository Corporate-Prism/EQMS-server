import Deviation from "../../models/deviation/Deviation.js";
import InvestigationTeam from "../../models/deviation/InvestigationTeam.js";


export const createInvestigationTeam = async (req, res) => {
  try {
    const { deviationId, members, remarks } = req.body;
    const user = req.user;

    const deviation = await Deviation.findById(deviationId);
    if (!deviation) return res.status(404).send({ message: "Deviation not found" });
    if (deviation.status !== "Accepted By QA") {
      return res.status(400).send({
        message: "Investigation team can only be created after QA approval.",
      });
    }
    const team = new InvestigationTeam({
      deviation: deviation._id,
      members,
      remarks,
      createdBy: user._id,
    });
    await team.save();
    deviation.investigationTeam = team._id;
    deviation.investigationAssignedBy = user._id;
    deviation.status = "Investigation Team Assigned";
    await deviation.save();
    return res.status(201).send({
      message: "Investigation team created successfully.",
      success: true,
      deviation,
      team,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error creating investigation team", error: error.message });
  }
};

export const getAllInvestigationTeams = async (req, res) => {
  try {
    const teams = await InvestigationTeam.find()
      .populate({
        path: "deviation",
        select: "deviationNumber status",
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
    console.error("Error fetching investigation teams:", error);
    res.status(500).send({ message: "Error fetching investigation teams", error: error.message });
  }
};

export const getInvestigationTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await InvestigationTeam.findById(id)
      .populate({
        path: "deviation",
        select: "deviationNumber status department",
        populate: { path: "department", select: "departmentName" },
      })
      .populate({
        path: "members.user",
        select: "name email",
        populate: { path: "role", select: "roleName" },
      })
      .populate("createdBy", "name email");

    if (!team) return res.status(404).send({ message: "Investigation team not found" });

    res.status(200).send({
      success: true,
      team,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).send({ message: "Error fetching team", error: error.message });
  }
};

export const updateInvestigationTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks, members } = req.body;
    const team = await InvestigationTeam.findById(id);
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

export const deleteInvestigationTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await InvestigationTeam.findById(id);
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