import Appointment from "../models/Appointment.js";
import Vehicle from "../models/Vehicle.js";

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

    const appointments = await Appointment.find(query).populate({
      path: "vehicleId",
      populate: { path: "userId", select: "name email" }
    });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private (Admin, Technician)
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if(!status) {
       res.status(400);
       return next(new Error("Status is required"));
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      res.status(404);
      return next(new Error("Appointment not found"));
    }

    appointment.status = status;
    const updatedAppointment = await appointment.save();

    res.json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};
