import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.Cloudinary_cloud_name, 
    api_key: process.env.Cloudinary_api_key, 
    api_secret: process.env.Cloudinary_api_secret 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
      if (!localFilePath) return null;
  
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: "avatars",
        resource_type: "auto",
      });
  
      // Delete the file after upload
      fs.unlink(localFilePath, (err) => {
        if (err) console.error("Error deleting local file:", err);
      });
  
      return result;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      fs.unlink(localFilePath, (err) => {
        if (err) console.error("Error cleaning up failed file:", err);
      });
      return null;
    }
}

export {uploadOnCloudinary} 