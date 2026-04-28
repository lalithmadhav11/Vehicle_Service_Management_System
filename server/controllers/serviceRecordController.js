import ServiceRecord from "../models/ServiceRecord.js";
import Technician from "../models/Technician.js";
import Vehicle from "../models/Vehicle.js";
import Appointment from "../models/Appointment.js";

// @desc    Create service record from an appointment (Admin only)
// @route   POST /api/services
// @access  Private (Admin)
export const createServiceRecord = async (req, res, next) => {
  try {
    const { appointmentId, repairDetails } = req.body;

    if (!appointmentId || !repairDetails) {
      res.status(400);
      return next(new Error("appointmentId and repairDetails are required"));
    }

    // Find the appointment with populated data
    const appointment = await Appointment.findById(appointmentId)
      .populate("vehicleId")
      .populate("technicianId");

    if (!appointment) {
      res.status(404);
      return next(new Error("Appointment not found"));
    }

    if (!appointment.technicianId) {
      res.status(400);
      return next(new Error("Appointment must have a technician assigned first"));
    }

    // Check if a service record already exists for this appointment
    const existing = await ServiceRecord.findOne({ appointmentId });
    if (existing) {
      res.status(400);
      return next(new Error("A service record already exists for this appointment"));
    }

    // Find the Technician profile by userId
    const technician = await Technician.findOne({ userId: appointment.technicianId });
    if (!technician) {
      res.status(404);
      return next(new Error("Technician profile not found"));
    }

    const record = await ServiceRecord.create({
      appointmentId,
      vehicleId: appointment.vehicleId._id,
      technicianId: technician._id,
      repairDetails,
      serviceStatus: "Pending",
    });

    // Update appointment status to Confirmed if it's still Pending
    if (appointment.status === "Pending") {
      appointment.status = "Confirmed";
      await appointment.save();
    }

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

// @desc    Get service records
// @route   GET /api/services
// @access  Private
export const getServiceRecords = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === "customer") {
      const vehicles = await Vehicle.find({ userId: req.user._id });
      const vehicleIds = vehicles.map(v => v._id);
      query = { vehicleId: { $in: vehicleIds } };
    }

    // Technician sees only their assigned records
    if (req.user.role === "technician") {
      const techProfile = await Technician.findOne({ userId: req.user._id });
      if (techProfile) {
        query = { technicianId: techProfile._id };
      } else {
        return res.json([]);
      }
    }

    const records = await ServiceRecord.find(query)
      .populate({
        path: "vehicleId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("technicianId")
      .populate("appointmentId")
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Update service record status
// @route   PUT /api/services/:id
// @access  Private (Admin, Technician)
export const updateServiceRecord = async (req, res, next) => {
  try {
    const { serviceStatus } = req.body;
    const validStatuses = ["Pending", "In Progress", "Completed"];

    if (!serviceStatus || !validStatuses.includes(serviceStatus)) {
      res.status(400);
      return next(new Error(`serviceStatus must be one of: ${validStatuses.join(", ")}`));
    }

    const record = await ServiceRecord.findById(req.params.id);
    if (!record) {
      res.status(404);
      return next(new Error("Service record not found"));
    }

    // Both technician and admin can mark as Completed
    // (Admin for problem cases where repair is not possible)
    record.serviceStatus = serviceStatus;
    const updated = await record.save();

    // If marked as Completed, also update the appointment status
    if (serviceStatus === "Completed" && record.appointmentId) {
      const appointment = await Appointment.findById(record.appointmentId);
      if (appointment) {
        appointment.status = "Completed";
        await appointment.save();
      }
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
