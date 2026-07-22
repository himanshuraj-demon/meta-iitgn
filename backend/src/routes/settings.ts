import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middlewares/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Get a setting by key
router.get("/:key", async (req: Request, res: Response) => {
  const { key } = req.params;
  try {
    const setting = await prisma.site_settings.findUnique({
      where: { key },
    });

    if (!setting) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Setting not found" } });
    }

    res.json({ success: true, data: setting.value });
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch setting" } });
  }
});

// Update or create a setting (Admin only)
router.put("/:key", protect("admin"), async (req: Request, res: Response) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Value is required" } });
  }

  try {
    const setting = await prisma.site_settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    res.json({ success: true, data: setting.value });
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update setting" } });
  }
});

export default router;
