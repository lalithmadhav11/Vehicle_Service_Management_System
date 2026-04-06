import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get system-wide metrics/dashboard stats
// @route   GET /api/admin/metrics
// @access  Private (Admin)
export const getSystemMetrics = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    const vehicleCount = await Vehicle.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    
    // Calculate total revenue from paid invoices
    const invoices = await Invoice.find({ paymentStatus: "Paid" });
    const totalRevenue = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.json({
      userCount,
      vehicleCount,
      appointmentCount,
      totalRevenue
    });
  } catch (error) {
    next(error);
  }
};
