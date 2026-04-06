import express from "express";
import {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, bookAppointment)
  .get(protect, getAppointments);

router
  .route("/:id")
  .put(protect, authorizeRoles("admin", "technician"), updateAppointmentStatus);

export default router;
