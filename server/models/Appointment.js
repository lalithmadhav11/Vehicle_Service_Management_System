import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    serviceType: {
      type: String,
      required: [true, "Please add service type"],
    },
    appointmentDate: {
      type: Date,
      required: [true, "Please add appointment date"],
    },
    status: {
      type: String,
      enum: ["Booked", "In Progress", "Completed", "Cancelled"],
      default: "Booked",
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
