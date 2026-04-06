import express from "express";
import {
  getNotifications,
  markAsRead,
  createNotification
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getNotifications)
  .post(protect, authorizeRoles("admin", "technician"), createNotification);

router
  .route("/:id/read")
  .put(protect, markAsRead);

export default router;
