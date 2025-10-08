import express from "express";
import { addNewEquipment, deleteEquipment, getAllEquipments, getEquipmentById, updateEquipment } from "../../controllers/deviation/equipmentControllers.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/equipments/newEquipment:
 *   post:
 *     summary: Create a new equipment
 *     tags: [Equipments]
 *     description: Add a new equipment to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               equipmentName:
 *                 type: string
 *                 required: true
 *                 example: Weight machine
 *               equipmentCode:
 *                 type: string
 *                 required: true
 *                 example: WM
 *               departmentId:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Equipment created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/newEquipment", addNewEquipment);

/**
 * @swagger
 * /api/v1/equipments:
 *   get:
 *     summary: Retrieve all equipments
 *     tags: [Equipments]
 *     description: Fetch a list of all equipments with optional search filtering by name or code.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter equipments by name or code.
 *     responses:
 *       200:
 *         description: Equipments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 equipments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       equipmentName:
 *                         type: string
 *                       equipmentCode:
 *                         type: string
 *                       departmentId:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllEquipments);

/**
 * @swagger
 * /api/v1/equipments/{id}:
 *   get:
 *     summary: Retrieve equipment using equipment id
 *     tags: [Equipments]
 *     description: Fetch a equipment using equipment id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the equipment to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Equipment retrieved successfully
 *         content:
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getEquipmentById);

/**
 * @swagger
 * /api/v1/equipments/update/{id}:
 *   put:
 *     summary: Update equipment by ID
 *     tags: [Equipments]
 *     description: Update a equipment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the equipment to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               equipmentName:
 *                 type: string
 *                 example: Weight machine
 *     responses:
 *       200:
 *         description: Equipment updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Equipment not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:id", updateEquipment);

/**
 * @swagger
 * /api/v1/equipments/{id}:
 *   delete:
 *     summary: Delete equipment by ID
 *     tags: [Equipments]
 *     description: Delete a equipment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the equipment to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: equipment deleted successfully
 *       404:
 *         description: equipment not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteEquipment);

export default router;