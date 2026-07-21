import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from backend root directory .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configure Cloudinary only if the variables are set
export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('WARNING: Cloudinary credentials are not set. Media uploads will fall back to local disk storage.');
}

/**
 * Uploads a local file to Cloudinary and deletes the local file.
 * If Cloudinary is not configured, returns the local path to be served locally.
 * @param {string} localFilePath Path to the local file
 * @returns {Promise<{url: string, publicId: string}>} File details
 */
export const uploadToCloudinary = async (localFilePath: string): Promise<{ url: string; publicId: string; }> => {
  if (!isCloudinaryConfigured) {
    // If not configured, we return a URL path relative to the server
    // e.g., /uploads/filename.ext
    const filename = localFilePath.split(/[\\/]/).pop();
    return {
      url: `/uploads/${filename}`,
      publicId: `local_${filename}`,
    };
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'iitgn-wiki',
      resource_type: 'auto',
    });

    // Remove file from local temp storage
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    // Return local fallback on Cloudinary failure instead of crashing
    const filename = localFilePath.split(/[\\/]/).pop();
    return {
      url: `/uploads/${filename}`,
      publicId: `local_${filename}`,
    };
  }
};

/**
 * Deletes a file from Cloudinary using its publicId, or from local disk if it's a fallback.
 * @param {string} publicId Cloudinary public ID
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  if (!isCloudinaryConfigured || !publicId || publicId.startsWith('local_')) {
    if (publicId && publicId.startsWith('local_')) {
      const filename = publicId.replace('local_', '');
      const localPath = 'uploads/' + filename;
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
          return true;
        } catch (e) {
          console.error(`Failed to delete local fallback file ${localPath}:`, e);
        }
      }
    }
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};
