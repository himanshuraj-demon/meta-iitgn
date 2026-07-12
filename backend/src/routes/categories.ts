import { Router } from "express";
import { getCategories, createCategory, updateCategory } from "../controllers/category.controller.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.get("/", getCategories);
router.post("/", protect(), createCategory);
router.patch("/:id", protect("admin"), updateCategory);

export default router;
