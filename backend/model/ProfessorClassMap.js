import mongoose from "mongoose";
const schema = mongoose.Schema;

const TeacherSchema = new schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  class: { type: String, required: true },
  time: { type: String, required: true }, // stored in HH:mm format (e.g., "08:00")
});

export const ProfessorClassMap = mongoose.model("professorclassmap", TeacherSchema);
