import mongoose from "mongoose";

const BusInchargeSchema = new mongoose.Schema({
  name: String,
  email: String,
  pno: String,
  dob: String,
  password: String,
});

export const BusIncharge = mongoose.model("BusIncharge", BusInchargeSchema);
