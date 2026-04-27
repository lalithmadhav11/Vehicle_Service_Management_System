import Technician from "../models/Technician.js";
import User from "../models/User.js";

// @desc    Add a technician (Admin creates account + profile)
// @route   POST /api/technicians
// @access  Private (Admin only)
export const addTechnician = async (req, res, next) => {
  try {
    const { name, email, password, specialization, experience } = req.body;

    if (!name || !email || !password || !specialization || experience === undefined) {
      res.status(400);
      return next(new Error("Please provide all required fields: name, email, password, specialization, experience"));
    }

    if (password.length < 6) {
      res.status(400);
      return next(new Error("Password must be at least 6 characters"));
    }

    // Check if a user with this email already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(400);
      return next(new Error("An account with this email already exists"));
    }

    // Create a User account with role 'technician'
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "technician",
    });

    // Create the Technician profile linked to the User
    const technician = await Technician.create({
      userId: user._id,
      name: user.name,
      specialization: specialization.trim(),
      experience: Number(experience),
    });

    res.status(201).json({
      _id:          technician._id,
      userId:       user._id,
      name:         technician.name,
      email:        user.email,
      specialization: technician.specialization,
      experience:   technician.experience,
      createdAt:    technician.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all technicians
// @route   GET /api/technicians
// @access  Private (Admin, Technician)
export const getTechnicians = async (req, res, next) => {
  try {
    const technicians = await Technician.find({}).populate("userId", "email");
    const result = technicians.map((t) => ({
      _id:          t._id,
      userId:       t.userId?._id,
      name:         t.name,
      email:        t.userId?.email || "",
      specialization: t.specialization,
      experience:   t.experience,
      createdAt:    t.createdAt,
    }));
    res.json(result);
  } catch (error) {
    next(error);
  }
};
