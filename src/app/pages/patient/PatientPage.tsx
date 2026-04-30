import { Outlet, useLocation } from "react-router";
import { Navbar } from "../../components/Navbar";

const LINKS = [
  { label: "Find Doctors", to: "/patient" },
  { label: "My Appointments", to: "/patient/appointments" },
  { label: "My Enquiries", to: "/patient/enquiries" },
];

export function PatientPage() {
  const { pathname } = useLocation();
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Inter', sans-serif" }}>
      <Navbar links={LINKS} activePath={pathname} />
      <Outlet />
    </div>
  );
}