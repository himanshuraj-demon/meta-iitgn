import { Router } from "express";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/collegeinfo.controller.js";
import { checkAuth, protect } from "../middlewares/auth.js";

const router = Router();

router.get("/events", getEvents);
router.post("/events", checkAuth, protect("admin", "moderator"), createEvent);
router.put("/events/:event_id", checkAuth, protect("admin", "moderator"), updateEvent);
router.delete("/events/:event_id", checkAuth, protect("admin", "moderator"), deleteEvent);

export default router;
