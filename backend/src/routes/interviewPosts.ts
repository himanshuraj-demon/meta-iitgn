import { Router } from "express";
import {
  checkAuthOptional,
  protect,
} from "../middlewares/auth.js";
import {
  getFeedPosts,
  getFeaturedPosts,
  getUserStats,
  getMyPosts,
  createPost,
  toggleLikePost,
  getPendingPosts,
  approvePost,
  toggleFeaturePost,
  deletePost,
} from "../controllers/interviewPosts.js";

const router = Router();

// Public / Optional Auth routes
router.get("/", checkAuthOptional, getFeedPosts);
router.get("/featured", checkAuthOptional, getFeaturedPosts);

// Authenticated User routes
router.get("/my-stats", protect(), getUserStats);
router.get("/my-posts", protect(), getMyPosts);
router.post("/", protect(), createPost);
router.post("/:id/like", protect(), toggleLikePost);
router.delete("/:id", protect(), deletePost);

// Admin / Moderator routes
router.get("/admin/pending", protect("admin", "moderator"), getPendingPosts);
router.patch("/admin/:id/approve", protect("admin", "moderator"), approvePost);
router.patch("/admin/:id/feature", protect("admin", "moderator"), toggleFeaturePost);

export default router;
