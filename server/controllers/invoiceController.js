import Invoice from "../models/Invoice.js";
import Vehicle from "../models/Vehicle.js";

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Private (Admin)
export const createInvoice = async (req, res, next) => {
  try {
    const { vehicleId, totalAmount, paymentStatus } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      res.status(404);
      return next(new Error("Vehicle not found"));
    }

    const invoice = await Invoice.create({
      vehicleId,
      totalAmount,
      paymentStatus: paymentStatus || "Pending"
    });

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoices
// @route   GET /api/invoices
// @access  Private
export const getInvoices = async (req, res, next) => {
  try {
    let query = {};
    
    // Customer can only see their invoices
    if (req.user.role === "customer") {
      const vehicles = await Vehicle.find({ userId: req.user._id });
      const vehicleIds = vehicles.map(v => v._id);
      query = { vehicleId: { $in: vehicleIds } };
    }

    const invoices = await Invoice.find(query).populate({
      path: "vehicleId",
      populate: { path: "userId", select: "name email" }
    });

    res.json(invoices);
  } catch (error) {
    next(error);
  }
};
