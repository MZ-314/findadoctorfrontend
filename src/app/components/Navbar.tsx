import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth, UserRole } from "../context/AuthContext";

interface NavLink {
  label: string;
  to: string;
}

interface NavbarProps {
  links: NavLink[];
  activePath?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  patient: "Patient Account",
  doctor: "Doctor Account",
  hospital_admin: "Hospital Admin",
  staff: "Staff Account",
};

export function Navbar({ links, activePath }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const currentPath = activePath ?? window.location.pathname;

  return (
    <nav
      style={{
        height: "60px",
        background: "#ffffff",
        borderBottom: "1.5px solid #f0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 60px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Logo */}
      <Link to={
        user?.role === "patient" ? "/patient" :
        user?.role === "doctor" ? "/doctor" :
        user?.role === "hospital_admin" ? "/hospital" :
        user?.role === "staff" ? "/staff" : "/"
      } style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#ff4d4d", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="6" y="1" width="4" height="14" rx="1.5" fill="white" />
            <rect x="1" y="6" width="14" height="4" rx="1.5" fill="white" />
          </svg>
        </div>
        <span style={{ color: "#ff4d4d", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.4px" }}>FindADoctor</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        {links.map(({ label, to }) => {
          const active = currentPath === to || currentPath.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              style={{
                fontWeight: active ? 600 : 400,
                fontSize: "14px",
                color: active ? "#ff4d4d" : "#6b7280",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseOver={(e) => ((e.target as HTMLElement).style.color = "#ff4d4d")}
              onMouseOut={(e) => ((e.target as HTMLElement).style.color = active ? "#ff4d4d" : "#6b7280")}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "#9ca3af", display: "flex", alignItems: "center", position: "relative" }}>
          <Bell size={20} strokeWidth={1.8} />
        </button>

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <div
            onClick={() => setDropdownOpen((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}
          >
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#ff4d4d", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
              {user?.initials ?? "U"}
            </div>
            <ChevronDown size={14} color="#9ca3af" />
          </div>

          {dropdownOpen && (
            <div style={{ position: "absolute", top: "44px", right: 0, background: "#ffffff", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid #f3f4f6", minWidth: "200px", overflow: "hidden", zIndex: 100 }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ fontWeight: 600, fontSize: "14px", color: "#111827" }}>{user?.name}</div>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{ROLE_LABELS[user?.role ?? "patient"]}</div>
              </div>
              <button
                onClick={() => setDropdownOpen(false)}
                style={{ width: "100%", background: "none", border: "none", padding: "11px 16px", display: "flex", alignItems: "center", gap: "9px", cursor: "pointer", fontSize: "14px", color: "#6b7280", fontFamily: "'Inter', sans-serif", fontWeight: 500, transition: "background 0.15s" }}
                onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f9fafb")}
                onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
              >
                <User size={15} color="#9ca3af" /> My Profile
              </button>
              <button
                onClick={handleLogout}
                style={{ width: "100%", background: "none", border: "none", padding: "11px 16px", display: "flex", alignItems: "center", gap: "9px", cursor: "pointer", fontSize: "14px", color: "#ef4444", fontFamily: "'Inter', sans-serif", fontWeight: 500, borderTop: "1px solid #f3f4f6", transition: "background 0.15s" }}
                onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fef2f2")}
                onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
              >
                <LogOut size={15} color="#ef4444" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}