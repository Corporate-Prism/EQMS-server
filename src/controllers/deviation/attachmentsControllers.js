import { uploadToCloudinary } from "../../../utils/uploadToCloudinary.js";
import Attachments from "../../models/deviation/Attachments.js";
import fs from "fs";

export const uploadAttachment = async (req, res) => {
  try {
    const { deviationId } = req.params;

    // if (!deviationId) {
    //   return res.status(400).json({ message: "Deviation ID is required" });
    // }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Attachment file is required" });
    }

    const result = await uploadToCloudinary(
      req.file.path,
      "deviation_attachments"
    );

    // console.log(result);

    const newAttachment = new Attachments({
      deviationId,
      attachmentUrl: result.url,
    });

    await newAttachment.save();

    if (req.file?.path && fs.existsSync(req.file.path)) {
      await fs.promises.unlink(req.file.path);
      //   console.log("Local file deleted:", req.file.path);
    } else {
      console.log("No local file to delete:", req.file?.path);
      //   return;
    }

    return res.status(200).json({
      success: true,
      message: "Attachment uploaded successfully",
      newAttachment,
    });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await Attachments.findByIdAndDelete(attachmentId);

    if (!attachment) {
      return res
        .status(404)
        .json({ success: false, message: "Attachment not found" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Attachment deleted successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};
