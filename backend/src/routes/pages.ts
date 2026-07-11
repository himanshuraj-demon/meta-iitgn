import { Router } from "express";
import { getPage, getRecentNewPages, getRecentUpdatedPages, searchPages } from "../controllers/page.controller.js";

const router=Router();

router.get("/recent/new", getRecentNewPages);
router.get("/recent/updated", getRecentUpdatedPages);
router.get("/search", searchPages);
router.get("/:slug", getPage);
router.get("/page/:slug", getPage);




export default router;