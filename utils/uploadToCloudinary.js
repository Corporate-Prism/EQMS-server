import cloudinary from "./cloudinary.js";
import fs from "fs";

export const uploadFilesToCloudinary = async (files, folder = "eqms") => {
  const urls = [];
  for (const file of files) {
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder, resourceType: "auto"
    });
    urls.push(uploadResult.secure_url);
    fs.unlinkSync(file.path);
  }
  return urls;
}