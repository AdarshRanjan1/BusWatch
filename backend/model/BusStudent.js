import mongoose from "mongoose";
const schema = mongoose.Schema;

const BusStudentSchema = new schema({
  busNumber: { type: String, required: true },
  students: [
    {
      name: { type: String, required: true },
      regno: { type: String, required: true },
      status: { type: String, default: "present" },
    },
  ],
});

export const BusStudent = mongoose.model("busstudent", BusStudentSchema);
