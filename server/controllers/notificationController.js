import Notification from "../models/Notification.js";

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404);
      return next(new Error("Notification not found"));
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error("Not authorized to update this notification"));
    }

    notification.isRead = true;
    const updatedNotification = await notification.save();

    res.json(updatedNotification);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new notification (Internal use generally, but can be an API)
// @route   POST /api/notifications
// @access  Private (Admin, Technician)
export const createNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type } = req.body;

    const notification = await Notification.create({
      userId,
      title,
      message,
      type
    });

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};
