import express from "express";
import {
  createInvoice,
  getInvoices,
} from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, authorizeRoles("admin"), createInvoice)
  .get(protect, getInvoices);

export default router;
