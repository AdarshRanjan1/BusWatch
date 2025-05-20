import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/StudentForm.css";

const StudentForm = ({ togglePopup, defaultBus, setAttendanceMessage }) => {
  const [token] = useState(localStorage.getItem("token") || "");
  const [image, setImage] = useState({ contentType: "", data: "" });
  const [photoData, setPhotoData] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera(); // Cleanup on unmount
  }, []);

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = async () => {
    // Below if is extra 
    if (!videoRef.current || !videoRef.current.videoWidth) {
      alert("Camera not ready yet. Please wait a second and try again.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL("image/png");
    setImage(await fetch(photoDataUrl).then((res) => res.blob()));
    setPhotoData(photoDataUrl);
    stopCamera();
  };

  const ResetCamera = () => {
    setPhotoData("");
    startCamera();
  };

  const AttendSession = async (e) => {
    e.preventDefault();

    // Get IP address
    axios.defaults.withCredentials = false;
    const res = await axios.get("https://api64.ipify.org?format=json");
    axios.defaults.withCredentials = true;
    let IP = res.data.ip;

    if (!defaultBus) return alert("No bus selected!");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let locationString = `${latitude},${longitude}`;
          const currentTime = new Date();
          const currentTimeString = currentTime.toLocaleTimeString();

          let studentsWithStatus = [];
          try {
            const response = await axios.post("http://localhost:5050/sessions/getStudentsByBus", {
              busNumber: defaultBus,
            });
            studentsWithStatus = response.data.students.map((s) => ({
              name: s.name,
              regno: s.regno,
              status: s.status || "present",
            }));
          } catch (err) {
            console.error("❌ Error fetching students for attendance", err);
          }
          console.log("🧪 Debug form data:");
          console.log("session_id:", localStorage.getItem("session_id"));
          console.log("teacher_email:", localStorage.getItem("teacher_email"));
          console.log("student_email:", localStorage.getItem("email"));

          if (!localStorage.getItem("session_id") || !localStorage.getItem("teacher_email")) {
            try {
              const sessionRes = await axios.post("http://localhost:5050/sessions/getLatestSessionForBus", {
                busNumber: defaultBus,
              }, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
          
              const { session_id, teacher_email } = sessionRes.data;
              localStorage.setItem("session_id", session_id);
              localStorage.setItem("teacher_email", teacher_email);
            } catch (err) {
              console.error("❌ Error fetching session info:", err);
              return alert("Unable to find session details. Try again or contact admin.");
            }
          }
          const formData = {
            token,
            regno: defaultBus,
            session_id: localStorage.getItem("session_id"),
            teacher_email: localStorage.getItem("teacher_email"),
            IP,
            time: currentTimeString,
            date: currentTime.toISOString().split("T")[0],
            Location: locationString,
            student_email: localStorage.getItem("email"),
            image,
            students: studentsWithStatus,
          };

          try {
            const response = await axios.post(
              "http://localhost:5050/sessions/attend_session",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            setAttendanceMessage(response.data.message);
            togglePopup(); // ✅ Close the popup
            stopCamera();  // ✅ Stop the webcam
          } catch (err) {
            console.error("❌ Error sending attendance data:", err);
            alert("Error submitting attendance");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="form-popup">
      <button onClick={togglePopup}>
        <strong>X</strong>
      </button>
      <div className="form-popup-inner">
        <h5>Marking Attendance for Bus: {defaultBus}</h5>
        {!photoData && <video ref={videoRef} width={300} autoPlay={true} />}
        {photoData && <img src={photoData} width={300} alt="Captured" />}
        <div className="cam-btn">
          <button onClick={startCamera}>Start Camera</button>
          <button onClick={capturePhoto}>Capture</button>
          <button onClick={ResetCamera}>Reset</button>
        </div>

        <form onSubmit={AttendSession}>
          <button type="submit">Submit Attendance</button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
