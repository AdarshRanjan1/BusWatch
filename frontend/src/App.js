import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  TeacherDashboard,
  HomeLayout,
  Landing,
  Login,
  Logout,
  Register,
  Nav,
  NewSession,
  StudentDashboard,
  ForgotPassword,
} from "./pages/Index";
import BusInchargeDashboard from "./pages/BusInchargeDashboard";
import QrScanner from "./pages/QrScanner";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "teacher-dashboard",
        element: <TeacherDashboard />,
      },
      {
        path: "student-dashboard",
        element: <StudentDashboard />,
      },
      {
        path: "busincharge-dashboard", 
        element: <BusInchargeDashboard />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "create-session",
        element: <NewSession />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "scan-qr",
        element: <QrScanner />,
      },
      {
        path: "*",
        element: <h1>404 Not Found</h1>,
      },
    ],
  },
]);

function App() {
  return (
    <div>
      <Nav />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
