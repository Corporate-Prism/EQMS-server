import express from "express";
import multer from "multer";
import { createDeviation, getDeviations } from "../../controllers/deviation/deviationControllers.js";
import { authMiddleware, authorizeRoles } from "../../middlewares/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/create",
  upload.fields([
    { name: "detailedDescriptionAttachments", maxCount: 10 },
    { name: "relatedRecordsAttachments", maxCount: 10 },
  ]),
  createDeviation
);
router.get("/", authMiddleware, authorizeRoles("System Admin"), getDeviations)

export default router;
