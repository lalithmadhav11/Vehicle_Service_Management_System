import express from "express";
import {
  createInvoice,
  getInvoices,
  updateInvoice,
} from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, authorizeRoles("admin"), createInvoice)
  .get(protect, getInvoices);

// ✅ NEW: Admin can update invoice payment status
router
  .route("/:id")
  .put(protect, authorizeRoles("admin"), updateInvoice);

export default router;
