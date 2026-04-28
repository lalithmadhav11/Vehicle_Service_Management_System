import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "Please add item description"],
  },
  amount: {
    type: Number,
    required: [true, "Please add item amount"],
  },
  isOptional: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

const invoiceSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    items: {
      type: [invoiceItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: [true, "Please add total amount"],
    },
    approvalStatus: {
      type: String,
      enum: ["Pending Approval", "Approved", "Rejected"],
      default: "Pending Approval",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
