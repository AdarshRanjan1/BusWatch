//create a new session component
import React, { useState, useRef } from "react";
import axios from "axios";
import "../styles/StudentForm.css";

const StudentForm = ({ togglePopup }) => {
  //eslint-disable-next-line
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [image, setImage] = useState({ contentType: "", data: "" });
  const [photoData, setPhotoData] = useState(""); // To store the captured photo data
  const videoRef = useRef(null);

  const constraints = {
    video: true,
  };
  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  };
  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  };
  const capturePhoto = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas
      .getContext("2d")
      .drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

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
    let regno = e.target.regno.value;
  
    // Get user IP address
    axios.defaults.withCredentials = false;
    const res = await axios.get("https://api64.ipify.org?format=json");
    axios.defaults.withCredentials = true;
  
    let IP = res.data.ip;
    if (navigator.geolocation) {
      console.log("Geolocation is supported!");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let locationString = `${latitude},${longitude}`;
  
          if (regno.length > 0) {
            const currentTime = new Date(); // Current time as Date object
            const currentTimeString = currentTime.toLocaleTimeString(); // Current time as string
            const thresholdTime = new Date(); // Threshold time set to 8:00 AM
            thresholdTime.setHours(8, 0, 0, 0);
  
            const formData = {
              token: token,
              regno: regno,
              session_id: localStorage.getItem("session_id"),
              teacher_email: localStorage.getItem("teacher_email"),
              IP: IP,
              time: currentTimeString, // Current time
              date: currentTime.toISOString().split("T")[0],
              Location: locationString,
              student_email: localStorage.getItem("email"),
              image: image,
            };
  
            // First, send the attendance data
            try {
              console.log("Sending data to server");
              const response = await axios.post(
                "http://localhost:5050/sessions/attend_session",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );
  
              // Replace the contents of the popup with the server response
              document.querySelector(
                ".form-popup-inner"
              ).innerHTML = `<h5>${response.data.message}</h5>`;
            } catch (err) {
              console.error("Error sending attendance data:", err);
            }
  
            // Then, check the time and send an email if necessary
            if (currentTime > thresholdTime) {
              // Define arrays of students and their registration numbers
              const busMappings = {
                "T12": [
                  { name: "Adarsh Ranjan", regno: "21BCE5582" },
                  { name: "Sydney Sweeney", regno: "21BCE1169" },
                ],
                "T10": [
                  { name: "Apoorv D", regno: "21BCE1169" },
                  { name: "Pete Davidson", regno: "21BCE6996" },
                ],
              };
            
              // Find the students mapped to the current bus number (regno in this case represents the bus number)
              const studentsForBus = busMappings[regno] || [];
            
              // Create the student list string for the email content
              const studentList = studentsForBus
                .map((student) => `${student.name} (Reg: ${student.regno})`)
                .join(", ");
            
              try {
                console.log("Sending alert email as time is past 8:00 AM");
                await axios.post(
                  "http://localhost:5050/users/sendmail2", // API endpoint for sending email
                  {
                    email: "apoorv.d2021@vitstudent.ac.in",
                    subject: "Late Bus Arrival Alert",
                    message: `The Bus number- ${regno} arrived late at ${currentTimeString}.\n\nStudents in this bus: ${studentList}\n\nAdmin- BusWatch`,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
                console.log("Email sent successfully");
              } catch (err) {
                console.error("Error sending email:", err);
              }
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
      console.error("Geolocation is not supported by this browser.");
    }
  };
  
  

  return (
    <div className="form-popup">
      <button onClick={togglePopup}>
        <strong>X</strong>
      </button>
      <div className="form-popup-inner">
        <h5>Enter Bus Details</h5>
        {!photoData && <video ref={videoRef} width={300} autoPlay={true} />}
        {photoData && <img src={photoData} width={300} alt="Captured" />}
        <div className="cam-btn">
          <button onClick={startCamera}>Start Camera</button>
          <button onClick={capturePhoto}>Capture</button>
          <button onClick={ResetCamera}>Reset</button>
        </div>

        <form onSubmit={AttendSession}>
          <input
            type="text"
            name="regno"
            placeholder="Bus Number"
            autoComplete="off"
          />
          <button type="submit">Done</button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;