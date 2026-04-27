import express from "express";
import {
  createServiceRecord,
  getServiceRecords,
  updateServiceRecord,
} from "../controllers/serviceRecordController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, authorizeRoles("admin", "technician"), createServiceRecord)
  .get(protect, getServiceRecords);

// ✅ NEW: Admin and Technician can update service record status
router
  .route("/:id")
  .put(protect, authorizeRoles("admin", "technician"), updateServiceRecord);

export default router;
