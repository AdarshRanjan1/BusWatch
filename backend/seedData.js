import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import csv from "csv-parser";

import { StudentClassMap } from "./model/StudentClassMap.js";
import { ProfessorClassMap } from "./model/ProfessorClassMap.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected for seeding");
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
};

const loadCSVData = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing old data...");
    await StudentClassMap.deleteMany({});
    await ProfessorClassMap.deleteMany({});

    console.log("📥 Reading CSV files...");
    const students = await loadCSVData("./students.csv");
    const professors = await loadCSVData("./Updated_professors.csv");

    console.log("📦 Inserting students...");
    await StudentClassMap.insertMany(students);

    console.log("📦 Inserting professors...");
    await ProfessorClassMap.insertMany(professors);

    console.log("🎉 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedDatabase();
