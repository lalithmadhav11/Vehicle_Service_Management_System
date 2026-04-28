import express from "express";
import {
  createInvoice,
  getInvoices,
  updateInvoice,
  approveInvoice,
  rejectInvoice,
  } from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, authorizeRoles("admin"), createInvoice)
  .get(protect, getInvoices);

// Admin or Customer can update payment status
router
  .route("/:id")
  .put(protect, authorizeRoles("admin", "customer"), updateInvoice);

// Customer approves or rejects invoice
router
  .route("/:id/approve")
  .put(protect, authorizeRoles("customer"), approveInvoice);
router
  .route("/:id/reject")
  .put(protect, authorizeRoles("customer"), rejectInvoice);

// Stripe checkout
router.route("/verify-session").post(protect, verifyCheckoutSession);
router.route("/:id/create-checkout-session").post(protect, authorizeRoles("customer"), createCheckoutSession);

export default router;
