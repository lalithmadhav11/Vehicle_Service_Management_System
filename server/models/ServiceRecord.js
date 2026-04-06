import mongoose from "mongoose";

const serviceRecordSchema = new mongoose.Schema(
  {
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
      required: [true, "Please provide repair details"],
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
