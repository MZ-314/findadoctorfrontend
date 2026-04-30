import { createBrowserRouter, Navigate } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PatientPage } from "./pages/patient/PatientPage";
import { PatientHome } from "./pages/patient/PatientHome";
import { MyAppointments } from "./pages/patient/MyAppointments";
import { MyEnquiries } from "./pages/patient/MyEnquiries";
import { DoctorProfile } from "./pages/patient/DoctorProfile";

export const router = createBrowserRouter([
  { path: "/", Component: LoginPage },
  { path: "/register", Component: RegisterPage },

  {
    path: "/patient",
    Component: PatientPage,
    children: [
      { index: true, Component: PatientHome },
      { path: "doctor/:id", Component: DoctorProfile },
      { path: "appointments", Component: MyAppointments },
      { path: "enquiries", Component: MyEnquiries },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);