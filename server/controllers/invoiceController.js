import Invoice from "../models/Invoice.js";
import Vehicle from "../models/Vehicle.js";
import Appointment from "../models/Appointment.js";
import ServiceRecord from "../models/ServiceRecord.js";
import { sendDualNotification } from "../utils/notificationService.js";

// @desc    Create invoice (Admin creates with itemized breakdown)
// @route   POST /api/invoices
// @access  Private (Admin)
export const createInvoice = async (req, res, next) => {
  try {
    const { vehicleId, appointmentId, items } = req.body;

    if (!vehicleId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400);
      return next(new Error("vehicleId and items array are required"));
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      res.status(404);
      return next(new Error("Vehicle not found"));
    }

    // Calculate total from items
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const invoice = await Invoice.create({
      vehicleId,
      appointmentId: appointmentId || null,
      items,
      totalAmount,
      approvalStatus: "Pending Approval",
      paymentStatus: "Pending",
    });

    if (appointmentId) {
      const record = await ServiceRecord.findOne({ appointmentId });
      if (record) {
        record.assessmentStatus = "Invoiced";
        await record.save();
      }
    }

    // Notify customer
    if (vehicle.userId) {
      await sendDualNotification(
        vehicle.userId,
        "New Invoice Generated",
        `An invoice for your vehicle ${vehicle.vehicleNumber} has been generated based on the technician's assessment. Please review and approve it to begin the service.`,
        "General",
      );
    }

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
      const vehicleIds = vehicles.map((v) => v._id);
      query = { vehicleId: { $in: vehicleIds } };
    }

    const invoices = await Invoice.find(query)
      .populate({
        path: "vehicleId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("appointmentId")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice payment status
// @route   PUT /api/invoices/:id
// @access  Private (Admin, Customer for own invoices)
export const updateInvoice = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ["Pending", "Paid", "Cancelled"];

    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      res.status(400);
      return next(
        new Error(`paymentStatus must be one of: ${validStatuses.join(", ")}`),
      );
    }

    const invoice = await Invoice.findById(req.params.id).populate({
      path: "vehicleId",
      populate: { path: "userId", select: "_id" },
    });

    if (!invoice) {
      res.status(404);
      return next(new Error("Invoice not found"));
    }

    // Customer can only pay their own approved invoices
    if (req.user.role === "customer") {
      const ownerId = invoice.vehicleId?.userId?._id?.toString();
      if (ownerId !== req.user._id.toString()) {
        res.status(403);
        return next(new Error("Not authorized to update this invoice"));
      }
      if (paymentStatus !== "Paid") {
        res.status(403);
        return next(new Error("Customers can only pay invoices"));
      }
      if (invoice.approvalStatus !== "Approved") {
        res.status(400);
        return next(new Error("Invoice must be approved before payment"));
      }
    }

    invoice.paymentStatus = paymentStatus;
    const updated = await invoice.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Customer approves invoice
// @route   PUT /api/invoices/:id/approve
// @access  Private (Customer)
export const approveInvoice = async (req, res, next) => {
  try {
    const { items: updatedItems } = req.body;
    const invoice = await Invoice.findById(req.params.id).populate({
      path: "vehicleId",
      populate: { path: "userId", select: "_id" },
    });

    if (!invoice) {
      res.status(404);
      return next(new Error("Invoice not found"));
    }

    // Verify ownership
    const ownerId = invoice.vehicleId?.userId?._id?.toString();
    if (req.user.role === "customer" && ownerId !== req.user._id.toString()) {
      res.status(403);
      return next(new Error("Not authorized"));
    }

    if (invoice.approvalStatus !== "Pending Approval") {
      res.status(400);
      return next(
        new Error(
          "Invoice has already been " + invoice.approvalStatus.toLowerCase(),
        ),
      );
    }

    // If customer removed optional items before approving
    if (updatedItems && Array.isArray(updatedItems)) {
      invoice.items = updatedItems;
      invoice.totalAmount = updatedItems.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      );

      // Sync the updated optional items back to the Service Record
      if (invoice.appointmentId) {
        const serviceRecord = await ServiceRecord.findOne({
          appointmentId: invoice.appointmentId,
        });
        if (serviceRecord) {
          // Keep only the optional items that match the ones kept in the invoice
          serviceRecord.optionalItems = serviceRecord.optionalItems.filter(
            (opt) =>
              updatedItems.some(
                (item) =>
                  item.description === opt.description && item.isOptional,
              ),
          );
          await serviceRecord.save();
        }
      }
    }

    invoice.approvalStatus = "Approved";
    const updated = await invoice.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Customer rejects invoice → cancels appointment
// @route   PUT /api/invoices/:id/reject
// @access  Private (Customer)
export const rejectInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate({
      path: "vehicleId",
      populate: { path: "userId", select: "_id" },
    });

    if (!invoice) {
      res.status(404);
      return next(new Error("Invoice not found"));
    }

    // Verify ownership
    const ownerId = invoice.vehicleId?.userId?._id?.toString();
    if (req.user.role === "customer" && ownerId !== req.user._id.toString()) {
      res.status(403);
      return next(new Error("Not authorized"));
    }

    if (invoice.approvalStatus !== "Pending Approval") {
      res.status(400);
      return next(
        new Error(
          "Invoice has already been " + invoice.approvalStatus.toLowerCase(),
        ),
      );
    }

    invoice.approvalStatus = "Rejected";
    await invoice.save();

    // Cancel the linked appointment and update ServiceRecord
    if (invoice.appointmentId) {
      const appointment = await Appointment.findById(invoice.appointmentId);
      if (appointment) {
        appointment.status = "Cancelled";
        await appointment.save();
      }
      const serviceRecord = await ServiceRecord.findOne({
        appointmentId: invoice.appointmentId,
      });
      if (serviceRecord) {
        serviceRecord.assessmentStatus = "Rejected by Customer";
        await serviceRecord.save();
      }
    }

    res.json({ message: "Invoice rejected. Appointment cancelled.", invoice });
  } catch (error) {
    next(error);
  }
};
