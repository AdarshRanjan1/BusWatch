import React, { useState } from "react";
import axios from "axios";
import QRCode from "qrcode.react";
import "../styles/NewSession.css";

const NewSession = ({ togglePopup }) => {
  const [token] = useState(localStorage.getItem("token") || "");
  const [qrtoggle, setQrtoggle] = useState(false);
  const [qrData, setQrData] = useState("");
  const [students, setStudents] = useState([{ name: "", regno: "" }]);

  const createQR = async (e) => {
    e.preventDefault();

    const uuid = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    let session_id = uuid();
    let name = e.target.name.value;
    let duration = e.target.duration.value;
    let radius = e.target.radius.value;
    let time = new Date().toLocaleTimeString();
    let date = new Date().toISOString().split("T")[0];
    let location = "";

    // ✅ Validate HSRP format (like TN01AB1234)
    const hsrpPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    if (!hsrpPattern.test(duration)) {
      alert("❌ Please enter a valid HSRP number (e.g. TN01AB1234)");
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          location = `${latitude},${longitude}`;

          if (name && duration) {
            const formData = {
              token,
              session_id,
              date,
              time,
              name,
              duration,
              location,
              radius,
              students,
            };

            try {
              const response = await axios.post(
                "http://localhost:5050/sessions/create",
                formData
              );
              setQrData(response.data.url);
              setQrtoggle(true);
            } catch (err) {
              console.log("Error creating session:", err);
            }
          } else {
            alert("Please fill all the fields");
          }
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleStudentChange = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const addStudentField = () => {
    setStudents([...students, { name: "", regno: "" }]);
  };

  const removeStudentField = (index) => {
    const updated = students.filter((_, i) => i !== index);
    setStudents(updated);
  };

  const copyQR = () => {
    navigator.clipboard.writeText(qrData);
  };

  return (
    <div className="new-popup">
      <button onClick={togglePopup}>
        <strong>X</strong>
      </button>

      {!qrtoggle && (
        <div className="popup-inner">
          <h5>Create a New Record</h5>
          <form onSubmit={createQR}>
            <input type="text" name="name" placeholder="Bus Number" autoComplete="off" />
            <input type="text" name="duration" placeholder="HSRP Number" autoComplete="off" />
            <select name="radius" autoComplete="off">
              <option value="50">50 meters</option>
              <option value="75">75 meters</option>
              <option value="100">100 meters</option>
              <option value="150">150 meters</option>
            </select>

            <h4 style={{ color: "#ffd369" }}>Student List</h4>
            {students.map((student, index) => (
              <div key={index} style={{ marginBottom: "15px" }}>
                <input
                  type="text"
                  placeholder="Student Name"
                  value={student.name}
                  onChange={(e) => handleStudentChange(index, "name", e.target.value)}
                  autoComplete="off"
                />
                <input
                  type="text"
                  placeholder="Reg Number"
                  value={student.regno}
                  onChange={(e) => handleStudentChange(index, "regno", e.target.value)}
                  autoComplete="off"
                />
                {students.length > 1 && (
                  <button type="button" onClick={() => removeStudentField(index)} style={{ marginLeft: "10px" }}>
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addStudentField}
              style={{
                marginBottom: "20px",
                padding: "8px 16px",
                backgroundColor: "#ffd369",
                color: "#1c1c1c",
                fontWeight: "bold",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              + Add Student
            </button>

            <button type="submit">Create Record</button>
          </form>
        </div>
      )}

      {qrtoggle && (
        <div className="qr-code">
          <QRCode value={qrData} onClick={copyQR} size={200} />
          <button onClick={copyQR}>Copy</button>
        </div>
      )}
    </div>
  );
};

export default NewSession;