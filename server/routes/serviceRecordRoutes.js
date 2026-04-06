import express from "express";
import {
  createServiceRecord,
  getServiceRecords,
} from "../controllers/serviceRecordController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, authorizeRoles("admin", "technician"), createServiceRecord)
  .get(protect, getServiceRecords);

export default router;
