import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import NewSession from "./NewSession";
import SessionDetails from "./SessionDetails";

axios.defaults.withCredentials = true;

const TeacherDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [sessionList, setSessionList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSessionDisplay, setSessionDisplay] = useState(false);
  const [currentSession, setCurrentSession] = useState("");
  const navigate = useNavigate();

  const updateList = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5050/sessions/getSessions",
        {
          token: token,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSessionList(response.data.sessions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (busNumber) => {
    if (!window.confirm(`Are you sure you want to delete ${busNumber}?`)) return;
    try {
      const response = await axios.post(
        "http://localhost:5050/sessions/deleteBusRecord",
        { busNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data.message);
      updateList();
    } catch (error) {
      alert("Error deleting bus record");
      console.error(error);
    }
  };

  const toggleSessionDetails = (e) => {
    setCurrentSession(
      sessionList.filter((session) => {
        return session.session_id === e;
      })
    );
    setSessionDisplay(!isSessionDisplay);
  };

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (token === "" || token === undefined) {
      navigate("/login");
    } else {
      updateList();
      document.querySelector(".logout").style.display = "block";
    }
  }, [token]);

  const FlashCard = ({ session }) => {
    return (
      <div className="flashcard">
        <div className="front" onClick={() => toggleSessionDetails(session.session_id)}>
          <h4>{session.name}</h4>
        </div>
        <div className="delete-button-container">
          <button
            className="delete-btn"
            onClick={() => handleDelete(session.name)}
          >
            ❌
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-main">
      <div className="row1">
        <div className="heading">
          <h2>Your Buses</h2>
        </div>
        <div className="createbtncol">
          <button onClick={togglePopup} className="createbtn">
            Create Record
          </button>
        </div>
      </div>
      <div className="session-list">
        {sessionList.length > 0 ? (
          sessionList.map((session, index) => (
            <FlashCard key={index + session.session_id} session={session} />
          ))
        ) : (
          <p>No records found</p>
        )}
      </div>
      {isSessionDisplay && (
        <div className="popup-overlay">
          <SessionDetails
            currentSession={currentSession}
            toggleSessionDetails={toggleSessionDetails}
          />
        </div>
      )}
      {isOpen && (
        <div className="popup-overlay">
          <NewSession togglePopup={togglePopup} />
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
