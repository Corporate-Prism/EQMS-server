import express from "express";
import { addNewLocation, deleteLocation, getAllLocations, getLocationById, updateLocation } from "../../controllers/deviation/locationControllers.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/locations/newLocation:
 *   post:
 *     summary: Create a new location
 *     tags: [Locations]
 *     description: Add a new location to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationName:
 *                 type: string
 *                 required: true
 *                 example: Production floor
 *               department:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Location created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/newLocation", addNewLocation);

/**
 * @swagger
 * /api/v1/locations:
 *   get:
 *     summary: Retrieve all locations
 *     tags: [Locations]
 *     description: Fetch a list of all locations with optional search filtering by name or code.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter locations by name or code.
 *     responses:
 *       200:
 *         description: Locations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 locations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       locationName:
 *                         type: string
 *                       locationCode:
 *                         type: string
 *                       department:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllLocations);

/**
 * @swagger
 * /api/v1/locations/{id}:
 *   get:
 *     summary: Retrieve location using location id
 *     tags: [Locations]
 *     description: Fetch a location using location id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the location to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location retrieved successfully
 *         content:
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getLocationById);

/**
 * @swagger
 * /api/v1/locations/update/{id}:
 *   put:
 *     summary: Update location by ID
 *     tags: [Locations]
 *     description: Update a location by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the location to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationName:
 *                 type: string
 *                 example: Production Floor
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:id", updateLocation);

/**
 * @swagger
 * /api/v1/locations/{id}:
 *   delete:
 *     summary: Delete location by ID
 *     tags: [Locations]
 *     description: Delete a location by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the location to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: location deleted successfully
 *       404:
 *         description: location not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteLocation);

export default router;