import express from "express";
import { getAllUsers, getSystemMetrics } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All admin routes are protected and restricted to admin role
router.use(protect, authorizeRoles("admin"));

router.route("/users").get(getAllUsers);
router.route("/metrics").get(getSystemMetrics);

export default router;
