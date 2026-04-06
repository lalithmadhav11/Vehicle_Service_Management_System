import Vehicle from "../models/Vehicle.js";

// @desc    Add a vehicle
// @route   POST /api/vehicles
// @access  Private (Customer, Admin)
export const addVehicle = async (req, res, next) => {
  try {
    const { vehicleNumber, model, fuelType, purchaseYear } = req.body;

    const vehicleExists = await Vehicle.findOne({ vehicleNumber });
    if (vehicleExists) {
      res.status(400);
      return next(new Error("Vehicle with this number already exists"));
    }

    const vehicle = await Vehicle.create({
      userId: req.user._id,
      vehicleNumber,
      model,
      fuelType,
      purchaseYear,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vehicles (Admin, Technician: all; Customer: only theirs)
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res, next) => {
  try {
    // Pagination
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    // Search by vehicleNumber or model
    const searchParams = {};
    if (req.query.search) {
      searchParams.$or = [
        { vehicleNumber: { $regex: req.query.search, $options: "i" } },
        { model: { $regex: req.query.search, $options: "i" } }
      ];
    }

    let query = { ...searchParams };

    if (req.user.role === "customer") {
      query.userId = req.user._id;
    }

    const count = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .populate("userId", "name email")
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ vehicles, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("userId", "name email");
    
    if (!vehicle) {
      res.status(404);
      return next(new Error("Vehicle not found"));
    }

    // Role check: customer can only view own vehicle
    if (req.user.role === "customer" && vehicle.userId._id.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error("Not authorized to view this vehicle"));
    }

    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      res.status(404);
      return next(new Error("Vehicle not found"));
    }

    // Role check
    if (req.user.role === "customer" && vehicle.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error("Not authorized to update this vehicle"));
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedVehicle);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      res.status(404);
      return next(new Error("Vehicle not found"));
    }

    // Customer can only delete own vehicle, Admin can delete any
    if (req.user.role === "customer" && vehicle.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error("Not authorized to delete this vehicle"));
    }

    await Vehicle.deleteOne({ _id: vehicle._id });
    res.json({ message: "Vehicle removed" });
  } catch (error) {
    next(error);
  }
};
