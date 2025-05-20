import mongoose from "mongoose";
const schema = mongoose.Schema;

const StudentSchema = new schema({
  name: { type: String, required: true },
  regno: { type: String, required: true, unique: true },
  class: { type: String, required: true },
});

export const StudentClassMap = mongoose.model("studentclassmap", StudentSchema);

