import ServiceRecord from "../models/ServiceRecord.js";
import Technician from "../models/Technician.js";
import Vehicle from "../models/Vehicle.js";

// @desc    Create service record
// @route   POST /api/services
// @access  Private (Admin, Technician)
export const createServiceRecord = async (req, res, next) => {
  try {
    const { vehicleId, technicianId, repairDetails, serviceStatus } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      res.status(404);
      return next(new Error("Vehicle not found"));
    }

    const technician = await Technician.findById(technicianId);
    if (!technician) {
      res.status(404);
      return next(new Error("Technician not found"));
    }

    const record = await ServiceRecord.create({
      vehicleId,
      technicianId,
      repairDetails,
      serviceStatus: serviceStatus || "Pending"
    });

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
    
    // Customer can only see their service records
    if (req.user.role === "customer") {
      const vehicles = await Vehicle.find({ userId: req.user._id });
      const vehicleIds = vehicles.map(v => v._id);
      query = { vehicleId: { $in: vehicleIds } };
    }

    const records = await ServiceRecord.find(query)
      .populate("vehicleId")
      .populate("technicianId");

    res.json(records);
  } catch (error) {
    next(error);
  }
};
