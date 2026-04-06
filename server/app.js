import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import serviceRecordRoutes from "./routes/serviceRecordRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/services", serviceRecordRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/invoices", invoiceRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// error middleware
app.use(errorHandler);

export default app;