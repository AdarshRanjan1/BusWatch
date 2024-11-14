import React, { useState } from "react";
import "../styles/About.css";
import signup from "../assets/Signup.png";
import login from "../assets/Login.png";
import teacherd from "../assets/TeacherDashboard.png";
import teacherd2 from "../assets/TeacherDashboard2.png";
import studentd from "../assets/StudentDashboad.png";
import studentd2 from "../assets/StudentDashboad2.png";
import forgorPW from "../assets/Forgot pw.png";
import qr from "../assets/QR.png";
import newSession from "../assets/NewSession.png";
import attendance from "../assets/AttendanceGiven.png";
import sessionInfo from "../assets/SessionInfo.png";
import next from "../assets/next.png";
import prev from "../assets/previous.png";
import submitAttendance from "../assets/SubmitAttendance.png";
import lateMail from "../assets/lateMail.jpg";

const assets = [
  {
    image_url: signup,
    title: "Signup",
    caption:
      "Users have to sign up as either an Admin or a Guard. After signing up, they will receive an OTP on their registered email for authentication. Following this step, new users can set their passwords.",
  },
  {
    image_url: login,
    title: "Login",
    caption:
      "Upon each user login using their email and password credentials, a JSON Web Token (JWT) is generated and issued to facilitate authentication.",
  },
  {
    image_url: teacherd,
    title: "Admin Dashboard View",
    caption:
      "After an Admin logs in, they gain access to a feature where past attendance sessions of the buses are displayed. By clicking on these sessions, the Admin can view detailed information about each bus. Additionally, there is a functionality provided for the Admin to create new attendance sessions for new buses.",
  },
  {
    image_url: newSession,
    title: "Create New Session",
    caption:
      "Admin can create a new session by clicking on 'Create Record' button. They can set the Bus Number, Location, Time, and the Distance Parameter for Bus Attendance. The Distance Parameter is the maximum distance a Bus can be from the Admin location to be marked as present.",
  },
  {
    image_url: qr,
    title: "QR Code Generated",
    caption:
      "For each bus session created, a unique QR code is generated. This QR code is to be scanned by guards to mark the attendance. The QR code is displayed on the Admin's screen during the session. This can be viewed by the Admin by clicking on the session in the dashboard.",
  },
  {
    image_url: teacherd2,
    title: "Admin Dashboard View after creating a session",
    caption: "New Session is Created",
  },
  {
    image_url: studentd,
    title: "Guard Dashboard View",
    caption: "After a Guard logs in, they can view the attendance history.",
  },
  {
    image_url: submitAttendance,
    title: "Submit Attendance",
    caption:
      "Guards can submit the attendance by scanning the QR code displayed by the Admin during the session. They have to enter the Bus Number and capture a photo. The system will then mark the Bus as present or absent based on the distance parameter set by the Admin.",
  },
  {
    image_url: attendance,
    title: "Attendance Given",
    caption: "Attendance is successfully submitted",
  },
  {
    image_url: studentd2,
    title: "Guard Dashboard View after submitting attendance",
    caption: "Attendance is successfully submitted",
  },
  {
    image_url: sessionInfo,
    title: "Session Info in Admin Dashboard",
    caption:
      "Upon clicking on a past session, the system presents detailed session information including a QR code, a list of daily bus records along with the captured photos taken during attendance registration, and their respective distances from the Admin location. If the guard's distance exceeds the parameter set by the Admin, it will be displayed in red; otherwise, it will be shown in green.",
  },
  {
    image_url: lateMail,
    title: "Bus late mail",
    caption:
      "Faculty of the students who are in the late bus will get a message through email stating the bus is late.",
  },
  {
    image_url: forgorPW,
    title: "Forgot Password",
    caption:
      "Users can reset their passwords by clicking on the 'Forgot Password' link on the login page. They will receive an OTP on their registered email for authentication. Following this step, users can set their new passwords.",
  },
];

const About = ({ toggleDone }) => {
  const [active, setActive] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const onNext = () => {
    if (active < assets.length - 1) {
      setActive(active + 1);
    } else {
      toggleDone();
    }
  };

  const onPrev = () => {
    if (active > 0) {
      setActive(active - 1);
    }
  };

  const Slide = ({ image_url, title, caption, active }) => {
    return (
      <div className={`slide ${active ? "active" : ""}`}>
        <img
          src={image_url}
          alt={caption}
          onMouseEnter={() => {
            setShowContent(true);
          }}
          onMouseLeave={() => {
            setShowContent(false);
          }}
        />
        {showContent ? (
          <span
            onMouseEnter={() => {
              setShowContent(true);
            }}
            onMouseLeave={() => {
              setShowContent(false);
            }}
            className="caption"
          >
            <ul>
              <h3>{title}</h3>
              <li>
                <p>{caption}</p>
              </li>
            </ul>
          </span>
        ) : (
          <div></div>
        )}
      </div>
    );
  };

  return (
    <div className="slider">
      <h2>Tutorial</h2>
      <div className="slides">
        {assets.map((e, i) => (
          <Slide key={e.caption} {...e} active={i === active} />
        ))}
      </div>
      <div className="navigation">
        <div className="navigation-bottom">
          {assets.map((e, i) => (
            <button
              className={`preview ${i === active ? "active" : ""}`}
              key={e.caption}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(active)}
              style={{ width: "1px" }}
            />
          ))}
        </div>
        <div className="navigation-next-prev">
          <div className="next-prev prev" onClick={onPrev}>
            {" "}
            <img src={prev} alt="<" />
          </div>
          <div className="next-prev next" onClick={onNext}>
            {" "}
            <img src={next} alt=">" />
          </div>
        </div>
      </div>
      <button className="skipbtn" onClick={toggleDone}>
        Skip
      </button>
    </div>
  );
};

export default About;
