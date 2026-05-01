import { Outlet, useLocation } from "react-router";
import { Navbar } from "../../components/Navbar";

const LINKS = [
  { label: "Overview", to: "/staff" },
  { label: "Hospitals", to: "/staff/hospitals" },
  { label: "Doctors", to: "/staff/doctors" },
];

export function StaffPage() {
  const { pathname } = useLocation();
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Inter', sans-serif" }}>
      <Navbar links={LINKS} activePath={pathname} />
      <Outlet />
    </div>
  );
}