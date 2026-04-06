import express from "express";
import {
  addTechnician,
  getTechnicians,
} from "../controllers/technicianController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, authorizeRoles("admin"), addTechnician)
  .get(protect, authorizeRoles("admin", "technician"), getTechnicians);

export default router;
