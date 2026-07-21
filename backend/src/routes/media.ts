import { Router } from "express";
// @ts-ignore
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma.js";
import { uploadToCloudinary, isCloudinaryConfigured } from "../utils/upload.js";
import { checkAuth } from "../middlewares/auth.js";

const router = Router();

// Ensure upload directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIMES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "application/pdf": ".pdf"
};

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const mime = file.mimetype ? file.mimetype.toLowerCase() : "";
    const ext = ALLOWED_MIMES[mime] || ".bin";
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // Global max size 20MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const mime = file.mimetype ? file.mimetype.toLowerCase() : "";
    if (mime in ALLOWED_MIMES) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEGs, PNGs, GIFs, WEBPs, and PDFs are allowed."));
    }
  }
});

router.post("/upload", checkAuth, upload.single("file"), async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;
  const fileSize = req.file.size;

  try {
    // 1. Validate file size and type
    const mime = mimeType ? mimeType.toLowerCase() : "";
    if (!(mime in ALLOWED_MIMES)) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Invalid file type. Only JPEGs, PNGs, GIFs, WEBPs, and PDFs are allowed." });
    }

    const isImage = mime.startsWith("image/");
    const isPdf = mime === "application/pdf";

    if (isImage && fileSize > 2 * 1024 * 1024) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Image size cannot exceed 2MB" });
    }

    if (isPdf && fileSize > 20 * 1024 * 1024) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: "PDF size cannot exceed 20MB" });
    }

    // 2. Compute file hash (SHA-256)
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);
    const fileHash = hashSum.digest("hex");

    // 3. Check for duplicates in DB
    const existingAsset = await prisma.media_assets.findFirst({
      where: {
        hash: fileHash,
        deleted_at: null
      }
    });

    const userId = Number(req.user.user_id);

    if (existingAsset) {
      let fileUrl = existingAsset.file_url;
      const isCloudinaryUrl = fileUrl.includes("cloudinary.com");
      
      let isReusable = false;
      if (isCloudinaryUrl) {
        isReusable = true;
      } else if (fileUrl.includes("/uploads/")) {
        const localFilename = fileUrl.split("/uploads/").pop();
        const physicalPath = localFilename ? path.join(uploadDir, localFilename) : null;
        // Only reuse local URL if Cloudinary is NOT configured AND the physical file actually exists
        if (!isCloudinaryConfigured && physicalPath && fs.existsSync(physicalPath)) {
          isReusable = true;
        }
      }

      if (isReusable) {
        // Delete newly uploaded temp file immediately since we reuse the existing valid URL
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        if (fileUrl.startsWith("/uploads/")) {
          const host = req.get("host") || "localhost:3001";
          const protocol = req.protocol || "http";
          fileUrl = `${protocol}://${host}${fileUrl}`;
        }

        // Create new reference for this user in DB
        const newAsset = await prisma.media_assets.create({
          data: {
            user_id: userId,
            file_url: fileUrl,
            file_type: mimeType,
            file_size: fileSize,
            hash: fileHash,
            public_id: existingAsset.public_id,
          }
        });

        return res.json({
          success: true,
          url: fileUrl,
          asset: newAsset,
          duplicate: true
        });
      }
    }

    // 4. Upload to Cloudinary (will delete local file upon success)
    const uploadResult = await uploadToCloudinary(filePath);

    let fileUrl = uploadResult.url;
    if (fileUrl.startsWith("/uploads/")) {
      const host = req.get("host") || "localhost:3001";
      const protocol = req.protocol || "http";
      fileUrl = `${protocol}://${host}${fileUrl}`;
    }

    // 5. Store in database
    const newAsset = await prisma.media_assets.create({
      data: {
        user_id: userId,
        file_url: fileUrl,
        file_type: mimeType,
        file_size: fileSize,
        hash: fileHash,
        public_id: uploadResult.publicId,
      }
    });

    return res.json({
      success: true,
      url: fileUrl,
      asset: newAsset,
      duplicate: false
    });
  } catch (error: any) {
    console.error("Error during media upload:", error);
    // Clean up if file still exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
