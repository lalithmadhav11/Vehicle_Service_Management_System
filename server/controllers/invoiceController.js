import Invoice from "../models/Invoice.js";
import Vehicle from "../models/Vehicle.js";

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Private (Admin)
export const createInvoice = async (req, res, next) => {
  try {
    const { vehicleId, totalAmount, paymentStatus } = req.body;

    if (!vehicleId || totalAmount === undefined) {
      res.status(400);
      return next(new Error("vehicleId and totalAmount are required"));
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      res.status(404);
      return next(new Error("Vehicle not found"));
    }

    const invoice = await Invoice.create({
      vehicleId,
      totalAmount: Number(totalAmount),
      paymentStatus: paymentStatus || "Pending",
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
      const vehicles   = await Vehicle.find({ userId: req.user._id });
      const vehicleIds = vehicles.map(v => v._id);
      query = { vehicleId: { $in: vehicleIds } };
    }

    const invoices = await Invoice.find(query)
      .populate({
        path: "vehicleId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice payment status
// @route   PUT /api/invoices/:id
// @access  Private (Admin)
export const updateInvoice = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ["Pending", "Paid", "Cancelled"];

    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      res.status(400);
      return next(new Error(`paymentStatus must be one of: ${validStatuses.join(", ")}`));
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404);
      return next(new Error("Invoice not found"));
    }

    invoice.paymentStatus = paymentStatus;
    const updated = await invoice.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
