import { Router } from "express";
import upload from "../middleware/Multer.js";
import SessionController from "../controllers/SessionController.js";
import JWT from "../middleware/JWT.js";
const router = Router(); // creating a router

//login
router.post("/create", JWT.verifyToken, SessionController.CreateNewSession);
//get sessions
router.post(
  "/getSessions",
  JWT.verifyToken,
  SessionController.GetAllTeacherSessions
);
//get QR
router.post("/getQR", JWT.verifyToken, SessionController.GetQR);
//attend session
router.post(
  "/attend_session",
  JWT.verifyToken,
  upload.single("image"),
  SessionController.AttendSession
);
//get student sessions
router.post(
  "/getStudentSessions",
  JWT.verifyToken,
  SessionController.GetStudentSessions
);

router.post(
  "/getAllBuses",
  JWT.verifyToken,
  SessionController.GetAllBuses // ✅ new function for Bus Incharge
);

router.post("/getBusStudents", JWT.verifyToken, SessionController.GetBusStudents);

router.post("/getStudentsByBus", JWT.verifyToken, SessionController.GetStudentsByBus);

router.post(
  "/submitBusAttendance",
  JWT.verifyToken,
  SessionController.SubmitBusAttendance
);

router.post("/getLatestSessionForBus", JWT.verifyToken, SessionController.GetLatestSessionForBus); //Extra

router.post("/getSessionById", JWT.verifyToken, SessionController.GetSessionById);

router.post("/deleteBusRecord", JWT.verifyToken, SessionController.DeleteBusRecord);

export default router;
