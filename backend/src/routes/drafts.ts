import { Router } from "express";
import { listPendingDrafts, reviewDraft, submitDraft } from "../controllers/draft.controller.js";

const router=Router();

router.post("/", submitDraft);
router.get("/pending", listPendingDrafts);
router.post("/:pending_id/review", reviewDraft);




export default router;