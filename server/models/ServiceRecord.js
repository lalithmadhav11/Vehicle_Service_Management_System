import mongoose from "mongoose";

const serviceRecordSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      required: true,
    },
    repairDetails: {
      type: String,
      // No longer strictly required upon creation, filled in during/after assessment
      default: "",
    },
    assessmentStatus: {
      type: String,
      enum: ["Pending Assessment", "Assessed", "Not Possible", "Invoiced", "Rejected by Customer"],
      default: "Pending Assessment",
    },
    problems: {
      type: String,
      default: "",
    },
    necessaryItems: [
      {
        description: String,
        amount: Number,
      }
    ],
    optionalItems: [
      {
        description: String,
        amount: Number,
      }
    ],
    repairNotPossibleReason: {
      type: String,
      default: "",
    },
    serviceStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRecord = mongoose.model("ServiceRecord", serviceRecordSchema);

export default ServiceRecord;
