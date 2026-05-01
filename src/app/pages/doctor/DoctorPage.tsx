import { Outlet, useLocation } from "react-router";
import { Navbar } from "../../components/Navbar";

const LINKS = [
  { label: "Dashboard", to: "/doctor" },
  { label: "Appointments", to: "/doctor/appointments" },
  { label: "Enquiries", to: "/doctor/enquiries" },
  { label: "Schedule", to: "/doctor/schedule" },
];

export function DoctorPage() {
  const { pathname } = useLocation();
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Inter', sans-serif" }}>
      <Navbar links={LINKS} activePath={pathname} />
      <Outlet />
    </div>
  );
}