/**
 * seedAdmin.js
 * Run this once to:
 *   1. Clear all collections in the database
 *   2. Create the admin account
 *
 * Usage: node seedAdmin.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Technician from "./models/Technician.js";
import Appointment from "./models/Appointment.js";
import Invoice from "./models/Invoice.js";
import Notification from "./models/Notification.js";
import ServiceRecord from "./models/ServiceRecord.js";
import Vehicle from "./models/Vehicle.js";

dotenv.config();

const ADMIN_NAME     = "Admin";
const ADMIN_EMAIL    = "sandeepadmin@gmail.com";
const ADMIN_PASSWORD = "Admin@123";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n✔  Connected to MongoDB\n");

    // ── Clear all collections ──────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Technician.deleteMany({}),
      Appointment.deleteMany({}),
      Invoice.deleteMany({}),
      Notification.deleteMany({}),
      ServiceRecord.deleteMany({}),
      Vehicle.deleteMany({}),
    ]);
    console.log("✔  All collections cleared\n");

    // ── Create admin account ───────────────────────────────────────────
    const admin = await User.create({
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role:     "admin",
    });

    console.log("✔  Admin account created successfully");
    console.log("────────────────────────────────────");
    console.log(`   Name    : ${admin.name}`);
    console.log(`   Email   : ${admin.email}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role    : ${admin.role}`);
    console.log("────────────────────────────────────\n");
    console.log("Done! You can now log in with the credentials above.\n");
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
