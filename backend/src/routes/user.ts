import { Router } from "express";
import { devBypass, getUsers, handleGoogleAuth, clearUser, handleMe, getUserStats, getUserById } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.post("/", devBypass);
router.get("/", getUsers);
router.get("/:user_id", getUserById);

// Authentication routes
router.get("/auth/google", handleGoogleAuth);
router.post("/auth/google", handleGoogleAuth);
router.post("/auth/logout", clearUser);
router.get("/auth/me", protect(), handleMe);
router.get("/:user_id/stats", protect(), getUserStats);

export default router;