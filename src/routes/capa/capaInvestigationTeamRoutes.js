import express from "express";
import { authAndAuthorize } from "../../middlewares/authMiddleware.js";
import { createCapaInvestigationTeam, deleteCapaInvestigationTeam, getAllCapaInvestigationTeams, getCapaInvestigationTeamById, updateCapaInvestigationTeam } from "../../controllers/capa/capaInvestigationTeamControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Capa Investigation Teams
 *     description: API endpoints for managing investigation teams
 */

/**
 * @swagger
 * /api/v1/capa-investigation-teams:
 *   post:
 *     summary: Create an investigation team for a capa
 *     description: Only allowed when the capa has been approved by QA.
 *     tags: [Capa Investigation Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - capaId
 *               - members
 *             properties:
 *               capaId:
 *                 type: string
 *                 description: ID of the capa to associate with the team
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
 *         description: Capa Investigation team created successfully.
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
 *                   example: Capa Investigation team created successfully.
 *                 capa:
 *                   type: object
 *                 team:
 *                   type: object
 *       400:
 *         description: capa not approved by QA yet.
 *       404:
 *         description: capa not found.
 *       500:
 *         description: Server error.
 */
router.post("/", authAndAuthorize("Approver"), createCapaInvestigationTeam);

/**
 * @swagger
 * /api/v1/capa-investigation-teams:
 *   get:
 *     summary: Get all investigation teams
 *     description: Fetches all investigation teams with their members and related capa details.
 *     tags: [Capa Investigation Teams]
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
 *                       capa:
 *                         type: object
 *                         properties:
 *                           capaNumber:
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
router.get("/", authAndAuthorize("System Admin", "Approver"), getAllCapaInvestigationTeams);

/**
 * @swagger
 * /api/v1/capa-investigation-teams/{id}:
 *   get:
 *     summary: Get details of a specific investigation team
 *     description: Fetches a single investigation team with populated members, roles, and related deviation details.
 *     tags: [Capa Investigation Teams]
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
 *                     capa:
 *                       type: object
 *                       properties:
 *                         capaNumber:
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
router.get("/:id", authAndAuthorize("System Admin", "Approver", "Creator", "Reviewer"), getCapaInvestigationTeamById);

/**
 * @swagger
 * /api/v1/capa-investigation-teams/{id}:
 *   put:
 *     summary: Update investigation team details
 *     description: Allows QA or Approver to modify remarks or update team members.
 *     tags: [Capa Investigation Teams]
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
router.put("/:id", authAndAuthorize("System Admin", "Approver", "Creator", "Reviewer"), updateCapaInvestigationTeam);


/**
 * @swagger
 * /api/v1/capa-investigation-teams/{id}:
 *   delete:
 *     summary: Delete an investigation team
 *     description: Only Admin or QA can delete a team (before investigation starts).
 *     tags: [Capa Investigation Teams]
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
router.delete("/:id", authAndAuthorize("System Admin", "Approver", "Creator", "Reviewer"), deleteCapaInvestigationTeam);
export default router;