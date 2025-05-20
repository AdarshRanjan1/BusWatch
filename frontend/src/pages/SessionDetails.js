//create a new session component
import React, { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "qrcode.react";
import "../styles/SessionDetails.css";

const SessionDetails = (props) => {
  const [qr, setQR] = useState("");
  const [studentList, setStudentList] = useState([]);

  async function getQR() {
    await axios
      .post("http://localhost:5050/sessions/getQR", {
        session_id: props.currentSession[0].session_id,
        token: localStorage.getItem("token"),
      })
      .then((response) => {
        setQR(response.data.url);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function fetchStudentList() {
    try {
      const res = await axios.post(
        "http://localhost:5050/sessions/getStudentsByBus",
        { busNumber: props.currentSession[0].name },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStudentList(res.data.students);
    } catch (err) {
      console.error("❌ Error fetching student list:", err);
    }
  }

  const showImage = (e) => {
    let image = e.target.src;
    let imageWindow = window.open("", "_blank");
    imageWindow.document.write(`<img src=${image} alt="student" width="50%" />`);
  };

  const copyQR = () => {
    navigator.clipboard.writeText(qr);
  };

  function getDistance(distance, radius) {
    return {
      distance,
      color: distance <= parseFloat(radius) ? "green" : "red",
    };
  }

  useEffect(() => {
    getQR();
    fetchStudentList();
  }, []);

  return (
    <div className="popup" style={{ overflowY: "auto", maxHeight: "90vh" }}>
      <button onClick={props.toggleSessionDetails}>
        <strong>X</strong>
      </button>
      <div className="popup-inner">
        <div className="popup-content">
          <div className="session-details">
            <p>
              <strong>Bus Number</strong>: {props.currentSession[0].name}
            </p>
            <p>
              <strong>Radius</strong>: {props.currentSession[0].radius} meters
            </p>
          </div>
          <div className="qr-code">
            <QRCode value={qr} onClick={copyQR} size={200} />
            <button onClick={copyQR} className="copybtn">
              Copy
            </button>
          </div>
        </div>

        <div className="student-list scrollable-content" style={{ maxHeight: "150px", overflowY: "auto" }}>
          <p>Students:</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Reg No</th>
              </tr>
            </thead>
            <tbody>
              {studentList.length > 0 ? (
                studentList.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td>{s.regno}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={2}>No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ height: "20px" }}></div>

        <div className="student-list scrollable-content" style={{ maxHeight: "300px", overflowY: "auto" }}>
          <p>Check-ins:</p>
          <table>
            <thead>
              <tr>
                <th>Guard ID</th>
                <th>IP</th>
                <th>Date</th>
                <th>Email</th>
                <th>Time</th>
                <th>Location</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {props.currentSession[0].attendance.map((student, index) => {
                return (
                  <tr key={index}>
                    <td>{student.regno}</td>
                    <td>{student.IP}</td>
                    <td>{student.date.split("T")[0]}</td>
                    <td>{student.student_email}</td>
                    <td>{student.time}</td>
                    <td>{props.currentSession[0].location}</td>
                    {student.image !== undefined ? (
                      <td>
                        <img
                          src={student.image}
                          alt="student"
                          className="student-image"
                          width={100}
                          onClick={showImage}
                        />
                      </td>
                    ) : (
                      <td>No Image</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;