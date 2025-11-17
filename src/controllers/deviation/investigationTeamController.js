import CAPA from "../../models/capa/Capa.js";
import Deviation from "../../models/deviation/Deviation.js";
import DeviationImpact from "../../models/deviation/DeviationImpact.js";
import InvestigationTeam from "../../models/deviation/InvestigationTeam.js";
import CapaInvestigationTeam from "../../models/capa/CapaInvestigationTeam.js";
import CapaImpact from "../../models/capa/CapaImpact.js";


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
    let team = await InvestigationTeam.findById(id)
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
    if (!team) {
      team = await InvestigationTeam.findOne({ deviation: id })
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
    }
    if (!team)
      return res
        .status(404)
        .send({ success: false, message: "Investigation team not found for provided ID or deviation." });

    res.status(200).send({
      success: true,
      team,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).send({ success: false, message: "Error fetching team", error: error.message });
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

export const recordTeamImpact = async (req, res) => {
  try {
    const { deviationId, answers } = req.body;
    const userId = req.user._id;
    const deviation = await Deviation.findById(deviationId).populate("investigationTeam");
    if (!deviation) return res.status(404).json({ message: "Deviation not found" });
    if (deviation.status !== "Investigation Team Assigned") return res.status(400).json({ message: "Impact assessment can only be recorded when investigation team is assigned" });
    const team = await InvestigationTeam.findById(deviation.investigationTeam);
    if (!team) return res.status(404).json({ message: "Investigation team not found" });
    const isMember = team.members.some(m => m.user.toString() === userId.toString());
    if (!isMember) return res.status(403).json({ message: "You are not authorized to record impact assessment for this deviation" });
    const newImpact = new DeviationImpact({
      deviationId,
      answers,
    });
    await newImpact.save();
    deviation.teamImpactAssessment = newImpact._id;
    deviation.status = "Team Impact Assessment Done";
    await deviation.save();
    res.status(201).json({
      success: true,
      message: "Team impact assessment recorded successfully",
      impact: newImpact,
    });

  } catch (error) {
    console.error("Error recording team impact assessment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const recordRootCauseAnalysis = async (req, res) => {
  try {
    const { type, targetId, answers } = req.body;
    const userId = req.user._id;

    if (!type || !["deviation", "capa"].includes(type))
      return res.status(400).json({ success: false, message: "Invalid type. Must be 'deviation' or 'capa'." });

    if (!targetId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "targetId and non-empty answers array are required.",
      });
    }

    let targetDoc;
    let team;
    let allowed = false;
    let newRCA;

    if (type === "deviation") {
      targetDoc = await Deviation.findById(targetId).populate("investigationTeam");
      if (!targetDoc)
        return res.status(404).json({ success: false, message: "Deviation not found." });

      if (targetDoc.status !== "Team Impact Assessment Done") {
        return res.status(400).json({
          success: false,
          message: "RCA can only be recorded after team impact assessment is completed.",
        });
      }

      team = await InvestigationTeam.findById(targetDoc.investigationTeam);
      if (!team)
        return res.status(404).json({ success: false, message: "Investigation team not found." });

      allowed = team.members.some((m) => m.user.toString() === userId.toString());
      if (!allowed)
        return res.status(403).json({
          success: false,
          message: "You are not authorized to record RCA for this deviation.",
        });

      newRCA = new DeviationImpact({
        deviationId: targetId,
        answers,
        createdBy: userId,
      });

      await newRCA.save();
    }

    else if (type === "capa") {
      targetDoc = await CAPA.findById(targetId);
      if (!targetDoc)
        return res.status(404).json({ success: false, message: "CAPA not found." });

      if (targetDoc.status !== "Investigation Team Assigned") {
        return res.status(400).json({
          success: false,
          message: "RCA can only be recorded when investigation team is assigned.",
        });
      }

      team = await CapaInvestigationTeam.findById(targetDoc.investigationTeam);
      if (!team)
        return res.status(404).json({ success: false, message: "Investigation team not found." });

      allowed = team.members.some((m) => m.user.toString() === userId.toString());
      if (!allowed)
        return res.status(403).json({
          success: false,
          message: "You are not authorized to record RCA for this capa.",
        });

      newRCA = new CapaImpact({
        capaId: targetId,
        answers,
        createdBy: userId,
      });

      await newRCA.save();
    }

    if (type === "deviation") {
      targetDoc.rootCauseAnalysis = newRCA._id;
      targetDoc.status = "Root Cause Analysis Done";
    } else {
      targetDoc.rootCauseAnalysis = newRCA._id;
      targetDoc.status = "Root Cause Analysis Done";
    }
    await targetDoc.save();
    res.status(201).json({
      success: true,
      message: `${type.toUpperCase()} RCA recorded successfully.`,
      rootCauseAnalysis: newRCA,
    });

  } catch (error) {
    console.error("Error recording RCA:", error);
    res.status(500).json({
      success: false,
      message: "Server error while recording root cause analysis.",
      error: error.message,
    });
  }
};

export const recordHistoricalCheck = async (req, res) => {
  try {
    const { deviationId, similarDeviations } = req.body;
    const userId = req.user._id;
    if (!deviationId) return res.status(400).json({ success: false, message: "deviationId is required" });
    const deviation = await Deviation.findById(deviationId);
    if (!deviation) return res.status(404).json({ success: false, message: "deviation not found" });
    if (deviation.status !== "Root Cause Analysis Done") return res.status(400).json({ message: "Historical Check can only be done after root cause analysis." });
    const team = await InvestigationTeam.findById(deviation.investigationTeam);
    if (!team) return res.status(404).json({ success: false, message: "Investigation team not found." });
    const isMember = team.members.some((m) => m.user.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to record historical check for this deviation.",
      });
    }
    deviation.similarDeviations = similarDeviations || [];
    deviation.historicalCheckedBy = userId;
    deviation.status = "Historical Check Done";
    await deviation.save();
    res.status(200).json({
      success: true,
      message: "Historical check recorded successfully.",
      data: deviation,
    });
  } catch (error) {
    console.error("Error recording historical check:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}