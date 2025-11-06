import express from "express";
import { createInvestigationTeam, deleteInvestigationTeam, getAllInvestigationTeams, getInvestigationTeamById, recordRootCauseAnalysis, recordTeamImpact, updateInvestigationTeam } from "../../controllers/deviation/investigationTeamController.js";
import { authAndAuthorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Investigation Teams
 *     description: API endpoints for managing investigation teams
 */

/**
 * @swagger
 * /api/v1/investigation-teams:
 *   post:
 *     summary: Create an investigation team for a deviation
 *     description: Only allowed when the deviation has been approved by QA.
 *     tags: [Investigation Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviationId
 *               - members
 *             properties:
 *               deviationId:
 *                 type: string
 *                 description: ID of the deviation to associate with the team
 *                 example: "67124f9c1234567890abcd12"
 *               remarks:
 *                 type: string
 *                 example: "Team created to start root cause analysis"
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       example: "671e5d2b3f4d2c9b6b123457"
 *     responses:
 *       201:
 *         description: Investigation team created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Investigation team created successfully.
 *                 deviation:
 *                   type: object
 *                 team:
 *                   type: object
 *       400:
 *         description: Deviation not approved by QA yet.
 *       404:
 *         description: Deviation not found.
 *       500:
 *         description: Server error.
 */
router.post("/", authAndAuthorize("Approver"), createInvestigationTeam);

/**
 * @swagger
 * /api/v1/investigation-teams:
 *   get:
 *     summary: Get all investigation teams
 *     description: Fetches all investigation teams with their members and related deviation details.
 *     tags: [Investigation Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of investigation teams.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       deviation:
 *                         type: object
 *                         properties:
 *                           deviationNumber:
 *                             type: string
 *                             example: QA-DEV001
 *                           status:
 *                             type: string
 *                             example: Investigation Team Assigned
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             user:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: John Doe
 *                                 email:
 *                                   type: string
 *                                   example: john@example.com
 *                                 role:
 *                                   type: object
 *                                   properties:
 *                                     roleName:
 *                                       type: string
 *                                       example: Investigator
 *       500:
 *         description: Server error.
 */
router.get("/", authAndAuthorize("System Admin", "Approver"), getAllInvestigationTeams);

/**
 * @swagger
 * /api/v1/investigation-teams/{id}:
 *   get:
 *     summary: Get details of a specific investigation team
 *     description: Fetches a single investigation team with populated members, roles, and related deviation details.
 *     tags: [Investigation Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Investigation team ID
 *         schema:
 *           type: string
 *           example: 67126afc1234567890abcd34
 *     responses:
 *       200:
 *         description: Investigation team retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 team:
 *                   type: object
 *                   properties:
 *                     deviation:
 *                       type: object
 *                       properties:
 *                         deviationNumber:
 *                           type: string
 *                           example: QA-DEV001
 *                         department:
 *                           type: object
 *                           properties:
 *                             departmentName:
 *                               type: string
 *                               example: Quality Assurance
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: Sarah Khan
 *                               email:
 *                                 type: string
 *                                 example: sarah@example.com
 *                               role:
 *                                 type: object
 *                                 properties:
 *                                   roleName:
 *                                     type: string
 *                                     example: QA Investigator
 *       404:
 *         description: Team not found.
 *       500:
 *         description: Server error.
 */
router.get("/:id", authAndAuthorize("System Admin", "Approver", "Creator", "Reviewer"), getInvestigationTeamById);

/**
 * @swagger
 * /api/v1/investigation-teams/{id}:
 *   put:
 *     summary: Update investigation team details
 *     description: Allows QA or Approver to modify remarks or update team members.
 *     tags: [Investigation Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Investigation team ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: "Added two new members for additional investigation support"
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       example: "671e5d2b3f4d2c9b6b123457"
 *     responses:
 *       200:
 *         description: Team updated successfully.
 *       404:
 *         description: Team not found.
 *       500:
 *         description: Server error.
 */
router.put("/:id", authAndAuthorize("System Admin", "Approver", "Creator", "Reviewer"), updateInvestigationTeam);


/**
 * @swagger
 * /api/v1/investigation-teams/{id}:
 *   delete:
 *     summary: Delete an investigation team
 *     description: Only Admin or QA can delete a team (before investigation starts).
 *     tags: [Investigation Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Investigation team ID
 *         schema:
 *           type: string
 *           example: 67126afc1234567890abcd34
 *     responses:
 *       200:
 *         description: Investigation team deleted successfully.
 *       404:
 *         description: Team not found.
 *       500:
 *         description: Server error.
 */
router.delete("/:id", authAndAuthorize("System Admin", "Approver", "Creator", "Reviewer"), deleteInvestigationTeam);

/**
 * @swagger
 * /api/v1/investigation-teams/impact-assessment:
 *   post:
 *     summary: Record Impact Assessment by Investigation Team
 *     description: Allows members of the assigned investigation team to record their impact assessment for a deviation.
 *     tags: [Investigation Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviationId
 *               - answers
 *             properties:
 *               deviationId:
 *                 type: string
 *                 description: The ID of the deviation for which the team is recording the impact assessment.
 *                 example: "67204e72b62e5a001e3c5a29"
 *               answers:
 *                 type: array
 *                 description: A list of question-answer pairs for the impact assessment.
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       description: ID of the impact assessment question.
 *                       example: "67124f9c1234567890abcd12"
 *                     answer:
 *                       type: string
 *                       description: Answer provided by the team.
 *                       example: "Yes, deviation affects batch integrity."
 *                     comment:
 *                       type: string
 *                       description: Optional additional comments.
 *                       example: "Further investigation needed."
 *     responses:
 *       201:
 *         description: Team impact assessment recorded successfully.
 *       400:
 *         description: Invalid status or missing fields.
 *       403:
 *         description: User not authorized.
 *       404:
 *         description: Deviation or team not found.
 *       500:
 *         description: Server error.
 */
router.post("/impact-assessment", authAndAuthorize("Creator"), recordTeamImpact);

/**
 * @swagger
 * /api/v1/investigation-teams/root-cause-analysis:
 *   post:
 *     summary: Record Root Cause Analysis by Investigation Team
 *     description: Allows members of the assigned investigation team to record the root cause analysis for a deviation after team impact assessment is done.
 *     tags: [Investigation Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviationId
 *               - answers
 *             properties:
 *               deviationId:
 *                 type: string
 *                 description: The ID of the deviation for which the team is recording the root cause analysis.
 *                 example: "67204e72b62e5a001e3c5a29"
 *               answers:
 *                 type: array
 *                 description: A list of question-answer pairs for the root cause analysis.
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       description: ID of the root cause analysis question.
 *                       example: "67124f9c1234567890abcd12"
 *                     answer:
 *                       type: string
 *                       description: Answer provided by the team.
 *                       example: "Root cause identified as equipment malfunction."
 *                     comment:
 *                       type: string
 *                       description: Optional additional comments.
 *                       example: "Preventive maintenance schedule to be updated."
 *     responses:
 *       201:
 *         description: Root cause analysis recorded successfully.
 *       400:
 *         description: Invalid status or missing fields.
 *       403:
 *         description: User not authorized.
 *       404:
 *         description: Deviation or team not found.
 *       500:
 *         description: Server error.
 */
router.post("/root-cause-analysis", authAndAuthorize("Creator"), recordRootCauseAnalysis);

export default router;