import Technician from "../models/Technician.js";

// @desc    Add a technician
// @route   POST /api/technicians
// @access  Private (Admin)
export const addTechnician = async (req, res, next) => {
  try {
    const { name, specialization, experience } = req.body;

    const technician = await Technician.create({
      name,
      specialization,
      experience
    });

    res.status(201).json(technician);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all technicians
// @route   GET /api/technicians
// @access  Private (Admin, Technician)
export const getTechnicians = async (req, res, next) => {
  try {
    const technicians = await Technician.find({});
    res.json(technicians);
  } catch (error) {
    next(error);
  }
};
