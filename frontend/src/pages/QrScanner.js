// QrScanner.js
import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import { useNavigate } from "react-router-dom";

const QrScanner = () => {
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleResult = (result) => {
    if (result?.text) {
      try {
        const url = new URL(result.text);
        const session_id = url.searchParams.get("session_id");
        const email = url.searchParams.get("email");

        if (session_id && email) {
          localStorage.setItem("session_id", session_id);
          localStorage.setItem("teacher_email", email);
          localStorage.setItem("fromQr", "true");
          navigate("/student-dashboard");
        } else {
          setErrorMsg("Invalid QR code");
        }
      } catch (err) {
        setErrorMsg("Failed to process QR code");
      }
    }
  };

  return (
    <div className="qr-scanner" style={{ textAlign: "center", padding: "20px" }}>
      <h2>Scan QR to Mark Attendance</h2>
      <div style={{ maxWidth: "300px", margin: "auto" }}>
        <QrReader
          constraints={{ facingMode: "environment" }}
          onResult={handleResult}
          style={{ width: "100%" }}
        />
      </div>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <button
        onClick={() => navigate("/student-dashboard")}
        style={{ marginTop: "20px", padding: "8px 16px", borderRadius: "6px" }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default QrScanner;
