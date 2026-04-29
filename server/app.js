import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes          from "./routes/authRoutes.js";
import vehicleRoutes       from "./routes/vehicleRoutes.js";
import appointmentRoutes   from "./routes/appointmentRoutes.js";
import serviceRecordRoutes from "./routes/serviceRecordRoutes.js";
import technicianRoutes    from "./routes/technicianRoutes.js";
import invoiceRoutes       from "./routes/invoiceRoutes.js";
import notificationRoutes  from "./routes/notificationRoutes.js";
import adminRoutes         from "./routes/adminRoutes.js";
import { errorHandler }    from "./middleware/errorMiddleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ── Middleware ── */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ── API Routes ── */
app.use("/api/auth",          authRoutes);
app.use("/api/vehicles",      vehicleRoutes);
app.use("/api/appointments",  appointmentRoutes);
app.use("/api/services",      serviceRecordRoutes);
app.use("/api/technicians",   technicianRoutes);
app.use("/api/invoices",      invoiceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin",         adminRoutes);

/* ── Health check ── */
app.get("/", (req, res) => res.json({ status: "API is running", version: "1.0.0" }));

/* ── Error handler (must be last) ── */
app.use(errorHandler);

export default app;