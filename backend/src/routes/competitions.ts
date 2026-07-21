import { Router } from "express";
import { getGithubRepos } from "../controllers/competitions.controller.js";

const router = Router();

/**
 * GET /competitions/repos?category=web-dev&level=all&page=1
 * Public – no authentication required.
 */
router.get("/repos", getGithubRepos);

export default router;
