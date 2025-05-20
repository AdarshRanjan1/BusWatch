import React, { useState } from "react";
import axios from "axios";
import "../styles/StudentForm.css";
import "../styles/AttendancePopup.css";


const AttendancePopup = ({ bus, closePopup }) => {
  const [attendance, setAttendance] = useState(
    (bus.students || []).map((student) => ({
      ...student,
      status: "present",
    }))
  );

  const handleChange = (index, value) => {
    const updated = [...attendance];
    updated[index].status = value;
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    const formattedData = {
      busNumber: bus.busNumber || bus.name,
      date: new Date().toISOString().split("T")[0],
      students: attendance,
    };

    try {
      const res = await axios.post(
        "http://localhost:5050/sessions/submitBusAttendance",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert(res.data.message);
      closePopup();
    } catch (err) {
      console.error("❌ Error submitting attendance", err);
      alert("Error submitting attendance");
    }
  };

  return (
    <div className="form-popup">
      <button onClick={closePopup}>
        <strong>X</strong>
      </button>
      <div className="form-popup-inner">
        <h5>Mark Attendance - {bus.busNumber || bus.name}</h5>
        {attendance.map((student, index) => (
          <div key={index}>
            <label>
              {student.name} ({student.regno})
              <select
                value={student.status}
                onChange={(e) => handleChange(index, e.target.value)}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </label>
          </div>
        ))}
        <button onClick={handleSubmit}>Submit Attendance</button>
      </div>
    </div>
  );
};

export default AttendancePopup;
