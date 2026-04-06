import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, "Please add a vehicle number"],
      unique: true,
    },
    model: {
      type: String,
      required: [true, "Please add a vehicle model"],
    },
    fuelType: {
      type: String,
      required: [true, "Please add fuel type"],
    },
    purchaseYear: {
      type: Number,
      required: [true, "Please add purchase year"],
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
