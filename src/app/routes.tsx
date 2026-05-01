import { createBrowserRouter, Navigate } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

import { PatientPage } from "./pages/patient/PatientPage";
import { PatientHome } from "./pages/patient/PatientHome";
import { MyAppointments } from "./pages/patient/myAppointments";
import { MyEnquiries } from "./pages/patient/MyEnquiries";
import { DoctorProfile } from "./pages/patient/DoctorProfile";

import { DoctorPage } from "./pages/doctor/DoctorPage";
import { DoctorDashboard } from "./pages/doctor/DoctorDashboard";
import { DoctorAppointments } from "./pages/doctor/DoctorAppointments";
import { DoctorEnquiries } from "./pages/doctor/DoctorEnquiries";
import { DoctorSchedule } from "./pages/doctor/DoctorSchedule";

import { HospitalPage } from "./pages/hospital/HospitalPage";
import { HospitalDashboard } from "./pages/hospital/HospitalDashboard";
import { HospitalDoctors } from "./pages/hospital/HospitalDoctors";
import { PendingDoctors } from "./pages/hospital/PendingDoctors";

import { StaffPage } from "./pages/staff/StaffPage";
import { StaffOverview } from "./pages/staff/StaffOverview";
import { StaffHospitals } from "./pages/staff/StaffHospitals";
import { StaffDoctors } from "./pages/staff/StaffDoctors";

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

  {
    path: "/doctor",
    Component: DoctorPage,
    children: [
      { index: true, Component: DoctorDashboard },
      { path: "appointments", Component: DoctorAppointments },
      { path: "enquiries", Component: DoctorEnquiries },
      { path: "schedule", Component: DoctorSchedule },
    ],
  },

  {
    path: "/hospital",
    Component: HospitalPage,
    children: [
      { index: true, Component: HospitalDashboard },
      { path: "doctors", Component: HospitalDoctors },
      { path: "pending", Component: PendingDoctors },
    ],
  },

  {
    path: "/staff",
    Component: StaffPage,
    children: [
      { index: true, Component: StaffOverview },
      { path: "hospitals", Component: StaffHospitals },
      { path: "doctors", Component: StaffDoctors },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);