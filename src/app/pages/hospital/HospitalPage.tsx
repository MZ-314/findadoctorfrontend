import { Outlet, useLocation } from "react-router";
import { Navbar } from "../../components/Navbar";

const LINKS = [
  { label: "Dashboard", to: "/hospital" },
  { label: "Our Doctors", to: "/hospital/doctors" },
  { label: "Pending Approvals", to: "/hospital/pending" },
];

export function HospitalPage() {
  const { pathname } = useLocation();
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Inter', sans-serif" }}>
      <Navbar links={LINKS} activePath={pathname} />
      <Outlet />
    </div>
  );
}