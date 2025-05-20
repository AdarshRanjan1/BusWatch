import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import StudentForm from "./StudentForm";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [tab, setTab] = useState("history");
  const [sessions, setSessions] = useState([]);
  const [buses, setBuses] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  const togglePopup = () => {
    setShowPopup(false);
    setSelectedBus(null);
    setSuccessMsg("");
  };

  useEffect(() => {
    const logoutButton = document.querySelector(".logout");
    if (logoutButton) logoutButton.style.display = "block";

    if (!token) navigate("/login");

    const fromQr = localStorage.getItem("fromQr");
    const session_id = localStorage.getItem("session_id");
    const teacher_email = localStorage.getItem("teacher_email");

    console.log("fromQr:", fromQr);
    console.log("session_id from QR:", session_id);
    console.log("teacher_email from QR:", teacher_email);
    console.log("Current tab is:", tab);

    if (fromQr && session_id && teacher_email && tab !== "mark") {
      setTab("mark");
      return;
    }

    if (tab === "history") {
      axios
        .post(
          "http://localhost:5050/sessions/getStudentSessions",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => setSessions(res.data.sessions))
        .catch((err) => console.error("Error fetching student sessions:", err));
    } else {
      axios
        .post(
          "http://localhost:5050/sessions/getAllBuses",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(async (res) => {
          console.log("✅ All fetched buses:", res.data.buses);
          setBuses(res.data.buses);

          if (fromQr && session_id && teacher_email) {
            try {
              const teacherRes = await axios.post(
                "http://localhost:5050/sessions/getSessionById",
                { session_id },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              const matchedSession = teacherRes.data.session;
              if (!matchedSession) {
                console.log("❌ Session not found for given session_id");
                return;
              }

              const busNumber = matchedSession.name;
              const matched = res.data.buses.find((bus) => bus.busNumber === busNumber);

              console.log("🎯 Bus number from matched session:", busNumber);
              console.log("🎯 Matched bus object:", matched);

              if (matched) {
                setSelectedBus(matched);
                setShowPopup(true);
                setSuccessMsg("✅ Attendance popup loaded successfully!");
              }
            } catch (err) {
              console.error("❌ Error fetching session or matching bus:", err);
            }

            localStorage.removeItem("fromQr");
            localStorage.removeItem("session_id");
            localStorage.removeItem("teacher_email");
          }
        })
        .catch((err) => console.error("Error fetching bus list:", err));
    }
  }, [tab, token, navigate]);

  return (
    <div className="dashboard-main">
      <div className="row1">
        <div className="heading">
          <h2>Student Dashboard</h2>
          <div style={{ marginTop: "10px" }}>
            <button onClick={() => setTab("history")}>Attendance History</button>
            <button onClick={() => setTab("mark")}>Mark Attendance</button>
            <button onClick={() => navigate("/scan-qr")}>📷 Scan QR</button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ textAlign: "center", margin: "10px", color: "green" }}>{successMsg}</div>
      )}

      {attendanceMessage && (
        <div style={{ textAlign: "center", margin: "10px", color: "green" }}>{attendanceMessage}</div>
      )}

      {tab === "history" ? (
        <div className="session-list">
          {sessions.length > 0 ? (
            sessions.map((s, index) => (
              <div className="flashcard" key={index}>
                <h4>{s.name} - {s.date}</h4>
                <p>Time: {s.time}</p>
                <p>Distance: {s.distance}m</p>
              </div>
            ))
          ) : (
            <p>No attendance records found.</p>
          )}
        </div>
      ) : (
        <div className="session-list">
          {buses.length > 0 ? (
            buses.map((bus, index) => (
              <div
                className="flashcard"
                key={index}
                onClick={() => {
                  setSelectedBus(bus);
                  setShowPopup(true);
                }}
              >
                <h4>{bus.busNumber || "Unnamed Bus"}</h4>
              </div>
            ))
          ) : (
            <p>No active buses available.</p>
          )}

          {showPopup && selectedBus && (
            <div className="popup-overlay">
              <StudentForm
                togglePopup={togglePopup}
                defaultBus={selectedBus.busNumber}
                setAttendanceMessage={setAttendanceMessage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
