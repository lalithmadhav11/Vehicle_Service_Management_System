import Appointment from "../models/Appointment.js";
import Vehicle from "../models/Vehicle.js";
import User from "../models/User.js";
import { sendDualNotification } from "../utils/notificationService.js";

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
export const bookAppointment = async (req, res, next) => {
  try {
    const { vehicleId, serviceType, appointmentDate } = req.body;

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      res.status(404);
      return next(new Error("Vehicle not found"));
    }

    // Verify ownership if user is customer
    if (req.user.role === "customer" && vehicle.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error("Not authorized to book appointment for this vehicle"));
    }

    const appointment = await Appointment.create({
      vehicleId,
      serviceType,
      appointmentDate,
    });

    // Notify customer about successful booking
    await sendDualNotification(
      vehicle.userId,
      "Appointment Booked Successfully",
      `Your appointment for vehicle ${vehicle.vehicleNumber} on ${new Date(appointmentDate).toLocaleDateString()} has been received.`,
      "General"
    );

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res, next) => {
  try {
    let query = {};
    
    // If customer, show only their appointments based on their vehicles
    if (req.user.role === "customer") {
      const vehicles = await Vehicle.find({ userId: req.user._id });
      const vehicleIds = vehicles.map(v => v._id);
      query = { vehicleId: { $in: vehicleIds } };
    }

    // If technician, show only appointments assigned to them
    if (req.user.role === "technician") {
      query = { technicianId: req.user._id };
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "vehicleId",
        populate: { path: "userId", select: "name email" }
      })
      .populate("technicianId", "name email");

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (and optionally assign technician)
// @route   PUT /api/appointments/:id
// @access  Private (Admin, Technician)
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, technicianId } = req.body;
    
    if(!status && !technicianId) {
       res.status(400);
       return next(new Error("Status or technicianId is required"));
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      res.status(404);
      return next(new Error("Appointment not found"));
    }

    const vehicleDoc = await Vehicle.findById(appointment.vehicleId);

    // Handle technician assignment notifications
    if (technicianId && !appointment.technicianId) {
      const techUser = await User.findById(technicianId);
      
      // Notify customer
      if (vehicleDoc && vehicleDoc.userId) {
        await sendDualNotification(
          vehicleDoc.userId,
          "Technician Assigned",
          `Technician ${techUser?.name || 'assigned'} has been assigned to your vehicle (${vehicleDoc.vehicleNumber}).`,
          "StatusUpdate"
        );
      }
      
      // Notify technician
      await sendDualNotification(
        technicianId,
        "New Appointment Assigned",
        `You have been assigned to service vehicle ${vehicleDoc?.vehicleNumber || 'a vehicle'}.`,
        "General"
      );
    }

    // Check if status is changed to Cancelled
    if (status && status === "Cancelled" && appointment.status !== "Cancelled") {
      if (vehicleDoc && vehicleDoc.userId) {
        // We can pass reason via req.body.reason if admin provided it, otherwise generic message
        const reason = req.body.reason ? ` Reason: ${req.body.reason}` : "";
        await sendDualNotification(
          vehicleDoc.userId,
          "Appointment Cancelled",
          `Your appointment for vehicle ${vehicleDoc.vehicleNumber} has been cancelled.${reason}`,
          "StatusUpdate"
        );
      }
    }

    if (status) appointment.status = status;
    if (technicianId) appointment.technicianId = technicianId;

    const updatedAppointment = await appointment.save();

    // Re-populate for response
    await updatedAppointment.populate([
      { path: "vehicleId", populate: { path: "userId", select: "name email" } },
      { path: "technicianId", select: "name email" },
    ]);

    res.json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};
