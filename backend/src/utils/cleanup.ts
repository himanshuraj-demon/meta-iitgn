import { prisma } from "../lib/prisma.js";
import { deleteFromCloudinary } from "./upload.js";

export async function runMediaCleanup() {
  console.log("[Cleanup] Starting 24-hour unused media assets garbage collector...");
  try {
    // 1. Query all media assets that are unused (used: false) AND older than 24 hours
    // (to prevent deleting assets being uploaded in currently active editing sessions)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const candidateAssets = await prisma.media_assets.findMany({
      where: {
        used: false,
        created_at: { lt: oneDayAgo },
        deleted_at: null,
      },
    });

    console.log(`[Cleanup] Found ${candidateAssets.length} candidate unused media assets older than 24 hours.`);
    if (candidateAssets.length === 0) {
      console.log("[Cleanup] No candidate assets to check. Cleanup complete.");
      return;
    }

    let deletedCount = 0;
    for (const asset of candidateAssets) {
      const fileUrl = asset.file_url;

      // 2. Perform database-side count checks to verify if the file_url is referenced anywhere
      
      // A. Check in live_pages (content or metadata image)
      const countLive = await prisma.live_pages.count({
        where: {
          OR: [
            { content: { contains: fileUrl } },
            { metadata: { path: ["image"], equals: fileUrl } }
          ]
        }
      });

      // B. Check in pending_pages (content or metadata image)
      const countPending = await prisma.pending_pages.count({
        where: {
          OR: [
            { content: { contains: fileUrl } },
            { metadata: { path: ["image"], equals: fileUrl } }
          ]
        }
      });

      // C. Check in revision_pages (content or metadata image)
      const countRevision = await prisma.revision_pages.count({
        where: {
          OR: [
            { content: { contains: fileUrl } },
            { metadata: { path: ["image"], equals: fileUrl } }
          ]
        }
      });

      // D. Check in blogs (content JSON string)
      const countBlogs = await prisma.blogs.count({
        where: {
          content: { contains: fileUrl }
        }
      });

      // E. Check in pending_blogs
      const countPendingBlogs = await prisma.pending_blogs.count({
        where: {
          content: { contains: fileUrl }
        }
      });

      // F. Check in revision_blogs
      const countRevisionBlogs = await prisma.revision_blogs.count({
        where: {
          content: { contains: fileUrl }
        }
      });

      // G. Check in interview_posts (content text or media array)
      const countInterview = await prisma.interview_posts.count({
        where: {
          deleted_at: null,
          OR: [
            { content: { contains: fileUrl } },
            { media: { path: [], array_contains: fileUrl } }
          ]
        }
      });

      const totalReferences = countLive + countPending + countRevision + countBlogs + countPendingBlogs + countRevisionBlogs + countInterview;

      if (totalReferences === 0) {
        // Unused! Delete from Cloudinary / local fallback
        console.log(`[Cleanup] Asset ${asset.media_id} (${fileUrl}) is unused. Deleting from storage...`);
        if (asset.public_id) {
          await deleteFromCloudinary(asset.public_id);
        }
        
        // Remove from database (hard delete)
        await prisma.media_assets.delete({
          where: { media_id: asset.media_id },
        });
        deletedCount++;
      } else {
        // Actually used! Update the status in the database so it's not scanned as a candidate next time
        console.log(`[Cleanup] Asset ${asset.media_id} (${fileUrl}) has ${totalReferences} reference(s). Marking as used.`);
        await prisma.media_assets.update({
          where: { media_id: asset.media_id },
          data: { used: true },
        });
      }
    }

    console.log(`[Cleanup] Garbage collector completed. Successfully deleted ${deletedCount} assets.`);
  } catch (error) {
    console.error("[Cleanup] Error running media asset cleanup:", error);
  }
}

// Start the cleanup timer running every 24 hours
export function startMediaCleanupCron() {
  // Run once on startup (delayed by 1 minute to not block server boot)
  setTimeout(() => {
    runMediaCleanup();
  }, 60 * 1000);

  // Then run every 24 hours
  setInterval(() => {
    runMediaCleanup();
  }, 24 * 60 * 60 * 1000);
}

/**
 * Extract all media URLs from a text or object (JSON string)
 */
export function extractUrlsFromText(text: string | null | undefined): string[] {
  if (!text) return [];
  const urls: string[] = [];

  // Match Cloudinary URLs
  const cloudinaryRegex = /https:\/\/res\.cloudinary\.com\/[^\s"')]+/g;
  let match;
  while ((match = cloudinaryRegex.exec(text)) !== null) {
    const url = match[0]?.trim();
    if (url) urls.push(url);
  }

  // Match local upload URLs starting with /uploads/
  const localRegex = /\/uploads\/[^\s"')]+/g;
  while ((match = localRegex.exec(text)) !== null) {
    const url = match[0]?.trim();
    if (url) urls.push(url);
  }

  // Match relative upload path
  const localRelativeRegex = /uploads\/[^\s"')]+/g;
  while ((match = localRelativeRegex.exec(text)) !== null) {
    const url = match[0]?.trim();
    if (url) {
      urls.push(url.startsWith('/') ? url : '/' + url);
    }
  }

  return urls;
}

/**
 * Marks media assets matching the provided URLs as used
 */
export async function markUrlsAsUsed(urls: string[]) {
  if (urls.length === 0) return;
  try {
    await prisma.media_assets.updateMany({
      where: {
        file_url: { in: urls },
        used: false,
      },
      data: { used: true },
    });
  } catch (err) {
    console.error("[Cleanup] Failed to mark URLs as used:", err);
  }
}

/**
 * Helper to process content and optional metadata image and mark them as used
 */
export async function processAndMarkMediaUsed(content: string | null | undefined, metadataImage?: string | null) {
  const urls = extractUrlsFromText(content);
  if (metadataImage) {
    urls.push(metadataImage);
  }
  if (urls.length > 0) {
    await markUrlsAsUsed(urls);
  }
}
