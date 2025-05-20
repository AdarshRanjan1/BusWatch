// ✅ UPDATED BusInchargeDashboard to fetch all buses from backend
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import AttendancePopup from "./AttendancePopup";

const BusInchargeDashboard = () => {
  const [token] = useState(localStorage.getItem("token") || "");
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchBuses = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5050/sessions/getAllBuses",
          { token }
        );
        setBuses(res.data.buses);
      } catch (err) {
        console.error("❌ Error fetching buses", err);
      }
    };

    fetchBuses();
    document.querySelector(".logout").style.display = "block";
  }, [token, navigate]);

  return (
    <div className="dashboard-main">
      <div className="row1">
        <div className="heading">
          <h2>All Buses</h2>
        </div>
      </div>

      <div className="session-list">
        {buses.length > 0 ? (
          buses.map((bus, index) => (
            <div
              key={index}
              className="flashcard"
              onClick={() => {
                setSelectedBus(bus);
                setShowPopup(true);
              }}
            >
              <h4>{bus.busNumber || "Unnamed Bus"}</h4>
            </div>
          ))
        ) : (
          <p>No buses found</p>
        )}
      </div>

      {showPopup && selectedBus && (
        <div className="popup-overlay">
          <AttendancePopup
            bus={selectedBus}
            closePopup={() => setShowPopup(false)}
          />
        </div>
      )}
    </div>
  );
};

export default BusInchargeDashboard;
