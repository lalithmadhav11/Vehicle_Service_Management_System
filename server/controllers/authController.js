import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      return next(new Error("Please provide name, email and password"));
    }

    // ✅ FIX: Block self-registration as admin.
    // Admin accounts can only be created directly in the database.
    const safeRole = role === "admin" ? "customer" : (role || "customer");

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      res.status(400);
      return next(new Error("An account with this email already exists"));
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: safeRole,
    });

    if (user) {
      res.status(201).json({
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      return next(new Error("Invalid user data"));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error("Please provide email and password"));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      return next(new Error("Invalid email or password"));
    }
  } catch (error) {
    next(error);
  }
};
