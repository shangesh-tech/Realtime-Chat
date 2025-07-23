import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", requireAuth, getUsersForSidebar);
router.get("/:id", requireAuth, getMessages);

router.post("/send/:id", requireAuth, sendMessage);

export default router;
