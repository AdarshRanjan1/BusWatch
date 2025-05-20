import dotenv from "dotenv";
dotenv.config();
import querystring from "querystring";
import { Teacher } from "../model/Teacher.js";
import { Student } from "../model/Student.js";
import uploadImage from "../middleware/Cloudinary.js";

import { BusStudent } from "../model/BusStudent.js";
import { StudentClassMap } from "../model/StudentClassMap.js";
import { ProfessorClassMap } from "../model/ProfessorClassMap.js";
import Mailer from "../middleware/Mailer.js";

function getQR(session_id, email) {
  let url = `${process.env.CLIENT_URL}/login?${querystring.stringify({
    session_id,
    email,
  })}`;
  return url;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}
function checkStudentDistance(Location1, Location2) {
  Location1 = Location1.split(",");
  Location2 = Location2.split(",");
  const locationLat1 = parseFloat(Location1[0]);
  const locationLon1 = parseFloat(Location1[1]);
  const locationLat2 = parseFloat(Location2[0]);
  const locationLon2 = parseFloat(Location2[1]);

  const distance = haversineDistance(
    locationLat1,
    locationLon1,
    locationLat2,
    locationLon2
  );
  return distance.toFixed(2);
}

async function CreateNewSession(req, res) {
  let { session_id, name, duration, location, radius, date, time, token, students } = req.body;
  let tokenData = req.user;

  let newSession = {
    session_id,
    date,
    time,
    name,
    duration,
    location,
    radius,
  };

  if (students && students.length > 0) {
    const busStudent = new BusStudent({
      busNumber: name,
      students: students,
    });
    await busStudent.save();
  }

  try {
    let teacher = await Teacher.findOneAndUpdate(
      { email: tokenData.email },
      { $push: { sessions: newSession } }
    );

    res.status(200).json({
      url: getQR(session_id, teacher.email),
      message: "Session created successfully",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function GetAllTeacherSessions(req, res) {
  try {
    let tokenData = req.user;
    const teacher = await Teacher.findOne({ email: tokenData.email });
    res.status(200).json({ sessions: teacher.sessions });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function GetAllBusSessions(req, res) {
  try {
    const allBuses = await BusStudent.find();
    res.status(200).json({ buses: allBuses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function GetAllBuses(req, res) {
  try {
    const allBusRecords = await BusStudent.find(); // contains busNumber & students
    res.status(200).json({ buses: allBusRecords });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


async function GetBusStudents(req, res) {
  const { busNumber } = req.body;
  try {
    const bus = await BusStudent.findOne({ busNumber });
    if (!bus) return res.status(404).json({ message: "No students found" });
    res.status(200).json({ students: bus.students });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function GetQR(req, res) {
  try {
    let tokenData = req.user;
    let url = getQR(req.body.session_id, tokenData.email);
    res.status(200).json({ url });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function AttendSession(req, res) {
  const {
    regno: busNumber,
    session_id,
    teacher_email,
    IP,
    time,
    date,
    Location,
    student_email,
    students = [],
  } = req.body;

  const imageName = req.file ? req.file.filename : null;
  const tokenData = req.user;

  // ✅ Prevent crash if session_id or teacher_email are missing
  if (!session_id || !teacher_email) {
    console.error("❌ Missing session_id or teacher_email in request");
    return res.status(400).json({
      message: "Session information is missing. Please use the QR or contact admin.",
    });
  }

  try {
    let present = false;
    const teacher = await Teacher.findOne({ email: teacher_email });
    if (!teacher) {
      console.error("❌ Teacher not found for email:", teacher_email);
      return res.status(400).json({ message: "Invalid teacher email" });
    }

    let session_details = {};

    for (const session of teacher.sessions) {
      if (session.session_id === session_id) {
        let distance = checkStudentDistance(Location, session.location);

        const alreadyMarked = session.attendance.some(
          (student) =>
            (student.regno === busNumber || student.student_email === student_email) &&
            student.date === date
        );

        if (!alreadyMarked) {
          const imageResult = await uploadImage(imageName);
          const currentTime = new Date().toLocaleTimeString();

          session_details = {
            session_id: session.session_id,
            teacher_email: teacher.email,
            name: session.name,
            date: session.date,
            time: currentTime,
            duration: session.duration,
            distance: distance,
            radius: session.radius,
            image: imageResult,
          };

          session.attendance.push({
            regno: busNumber,
            image: imageResult,
            date,
            IP,
            time,
            student_email: tokenData.email,
            Location,
            distance,
          });

          await Teacher.findOneAndUpdate(
            { email: teacher_email },
            { sessions: teacher.sessions }
          );

          await Student.findOneAndUpdate(
            { email: student_email },
            { $push: { sessions: session_details } }
          );

          // 📍 Late check using IST
          const currentIST = new Date(
            new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            })
          );
          const thresholdTime = new Date(currentIST);
          thresholdTime.setHours(8, 0, 0, 0);

          if (currentIST > thresholdTime) {
            const busRecord = await BusStudent.findOne({ busNumber });

            if (!busRecord || busRecord.students.length === 0) {
              console.log("❌ No students found for this bus");
              return res.status(200).json({
                message: "Attendance saved but no student list available",
              });
            }

            console.log("🔍 Retrieved Bus Record Before Email:", busRecord.students);

            let presentStudents = [];

            if (students && students.length > 0) {
              presentStudents = students.filter(
                (s) => s.status === "present" || s.status === "Present"
              );
            } else {
              presentStudents = busRecord.students.filter(
                (s) => s.status === "present" || s.status === "Present"
              );
            }

            if (presentStudents.length === 0) {
              console.log("✅ No present students to email");
              return res.status(200).json({
                message: "Attendance submitted. No present students to notify.",
              });
            }

            console.log("✅ Present students to notify:", presentStudents);
            const regnos = presentStudents.map((s) => s.regno);

            const studentClassMappings = await StudentClassMap.find({
              regno: { $in: regnos },
            });

            const classWiseStudents = {};
            for (let entry of studentClassMappings) {
              if (!classWiseStudents[entry.class]) classWiseStudents[entry.class] = [];
              classWiseStudents[entry.class].push(entry);
            }

            const professorMappings = await ProfessorClassMap.find({
              class: { $in: Object.keys(classWiseStudents) },
              time: { $lte: "08:50" },
            });

            const emailMap = new Map();
            for (let prof of professorMappings) {
              const students = classWiseStudents[prof.class] || [];
              if (!emailMap.has(prof.email)) {
                emailMap.set(prof.email, {
                  name: prof.name,
                  class: prof.class,
                  students: [],
                });
              }
              emailMap.get(prof.email).students.push(...students);
            }

            for (const [email, data] of emailMap.entries()) {
              const studentList = data.students
                .map((s) => `${s.name} (Reg: ${s.regno})`)
                .join(", ");

              const subject = `Late Bus Alert - ${busNumber}`;
              const message = `Dear ${data.name},\n\nThe following students from your class (${data.class}) were in a late bus (${busNumber}) at ${time} on ${date}:\n\n${studentList}\n\nPlease mark their attendance accordingly.\n\n- Admin (BusWatch)`;

              await Mailer.sendMail(email, subject, message);
              console.log(`📤 Email sent to ${email}`);
            }

            return res.status(200).json({
              message: "Attendance marked & Emails sent.",
            });
          } else {
            return res.status(200).json({
              message: "Attendance marked on time. No emails needed.",
            });
          }
        } else {
          present = true;
        }
      }
    }

    if (present) {
      return res.status(200).json({ message: "Attendance already marked" });
    }
  } catch (err) {
    console.error("❌ Backend error:", err);
    return res.status(400).json({ message: err.message });
  }
}



async function GetStudentSessions(req, res) {
  let tokenData = req.user;
  try {
    const student = await Student.findOne({
      email: tokenData.email,
    });
    res.status(200).json({ sessions: student.sessions });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function GetStudentsByBus(req, res) {
  const { busNumber } = req.body;
  try {
    const bus = await BusStudent.findOne({ busNumber });
    if (!bus || !bus.students || bus.students.length === 0) {
      return res.status(200).json({ students: [] });
    }
    res.status(200).json({ students: bus.students });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function SubmitBusAttendance(req, res) {
  const { busNumber, date, students } = req.body;

  try {
    // ✅ Ensure we save status field too
    const updatedBus = await BusStudent.findOneAndUpdate(
      { busNumber },
      {
        $set: {
          students: students.map((s) => ({
            name: s.name,
            regno: s.regno,
            status: s.status || "present", // default just in case
          })),
        },
      },
      { new: true }
    );

    console.log("✅ Updated Bus Student List:", updatedBus.students);
    res.status(200).json({ message: "Attendance saved successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error saving attendance", error: err });
  }
}

async function GetLatestSessionForBus(req, res) {
  const { busNumber } = req.body;

  try {
    const teachers = await Teacher.find({ "sessions.name": busNumber });
    for (let teacher of teachers) {
      const sessions = teacher.sessions.filter(s => s.name === busNumber);
      if (sessions.length > 0) {
        const latest = sessions[sessions.length - 1];
        return res.status(200).json({
          session_id: latest.session_id,
          teacher_email: teacher.email,
        });
      }
    }
    return res.status(404).json({ message: "No session found" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// Extra below one
async function GetSessionById(req, res) {
  const { session_id } = req.body;

  try {
    const teachers = await Teacher.find();
    for (let teacher of teachers) {
      const session = teacher.sessions.find((s) => s.session_id === session_id);
      if (session) {
        return res.status(200).json({ session });
      }
    }
    res.status(404).json({ message: "Session not found" });
  } catch (err) {
    console.error("Error in GetSessionById:", err);
    res.status(500).json({ message: "Server error" });
  }
}

//For delete
async function DeleteBusRecord(req, res) {
  const { busNumber } = req.body;

  try {
    // Delete from BusStudent collection
    await BusStudent.deleteOne({ busNumber });

    // Also delete from Teacher.sessions array
    const result = await Teacher.updateMany(
      {},
      { $pull: { sessions: { name: busNumber } } }
    );

    res.status(200).json({ message: `Bus record '${busNumber}' deleted from DB.` });
  } catch (err) {
    res.status(500).json({ message: "❌ Error deleting bus record", error: err.message });
  }
}



const SessionController = {
  CreateNewSession,
  GetAllTeacherSessions,
  GetAllBusSessions,
  GetAllBuses,
  GetBusStudents,
  GetQR,
  AttendSession,
  GetStudentSessions,
  GetStudentsByBus,
  SubmitBusAttendance,
  GetLatestSessionForBus,
  GetSessionById,
  DeleteBusRecord,
};

export default SessionController;
