import mongoose from "mongoose";

const technicianSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    specialization: {
      type: String,
      required: [true, "Please add specialization"],
    },
    experience: {
      type: Number,
      required: [true, "Please add years of experience"],
    },
  },
  {
    timestamps: true,
  }
);

const Technician = mongoose.model("Technician", technicianSchema);

export default Technician;
