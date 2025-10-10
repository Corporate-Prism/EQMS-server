import cloudinary from "./cloudinary.js";
import fs from "fs";

export const uploadToCloudinary = async (filePath, folder = "uploads") => {
  try {
    if (!filePath) throw new Error("No file path provided");

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });

    fs.unlinkSync(filePath);

    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};
