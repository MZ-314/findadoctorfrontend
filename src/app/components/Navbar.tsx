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
  patient:       "Patient Account",
  doctor:        "Doctor Account",
  hospital_admin:"Hospital Admin",
  staff:         "Staff Account",
};

const NAV  = "#0a2540";
const TEAL = "#00b4d8";

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

  const logoTo =
    user?.role === "patient"       ? "/patient"  :
    user?.role === "doctor"        ? "/doctor"   :
    user?.role === "hospital_admin"? "/hospital" :
    user?.role === "staff"         ? "/staff"    : "/";

  return (
    <nav style={{
      height: "62px",
      background: "#ffffff",
      borderBottom: "1.5px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 60px",
      position: "sticky",
      top: 0,
      zIndex: 50,
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Logo */}
      <Link to={logoTo} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: NAV, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <rect x="6" y="1" width="5" height="15" rx="1.5" fill={TEAL} />
            <rect x="1" y="6" width="15" height="5" rx="1.5" fill="white" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "17px", color: NAV, letterSpacing: "-0.4px", lineHeight: 1 }}>
            Docfolio
          </div>
          <div style={{ fontSize: "9px", color: "#64748b", fontWeight: 500, letterSpacing: "0.4px" }}>
            by SETV Healthcare
          </div>
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        {links.map(({ label, to }) => {
          const active = currentPath === to || currentPath.startsWith(to + "/");
          return (
            <Link key={to} to={to}
              style={{
                fontWeight: active ? 600 : 400,
                fontSize: "14px",
                color: active ? TEAL : "#64748b",
                textDecoration: "none",
                transition: "color 0.15s",
                position: "relative",
              }}
              onMouseOver={(e) => ((e.target as HTMLElement).style.color = TEAL)}
              onMouseOut={(e) => ((e.target as HTMLElement).style.color = active ? TEAL : "#64748b")}
            >
              {label}
              {active && (
                <span style={{
                  position: "absolute", bottom: "-21px", left: 0, right: 0,
                  height: "2px", background: TEAL, borderRadius: "2px 2px 0 0",
                }} />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "#94a3b8", display: "flex", alignItems: "center", borderRadius: "8px", transition: "background 0.15s" }}
          onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9")}
          onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
        >
          <Bell size={20} strokeWidth={1.8} />
        </button>

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <div onClick={() => setDropdownOpen((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}
          >
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%", background: NAV,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#ffffff", fontWeight: 700, fontSize: "13px", flexShrink: 0,
              border: "2px solid #e2e8f0",
            }}>
              {user?.initials ?? "U"}
            </div>
            <ChevronDown size={14} color="#94a3b8"
              style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            />
          </div>

          {dropdownOpen && (
            <div style={{
              position: "absolute", top: "48px", right: 0, background: "#ffffff",
              borderRadius: "14px", boxShadow: "0 8px 32px rgba(10,37,64,0.14)",
              border: "1px solid #e2e8f0", minWidth: "210px", overflow: "hidden", zIndex: 100,
            }}>
              {/* User info */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", color: NAV }}>{user?.name}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                  {ROLE_LABELS[user?.role ?? "patient"]}
                </div>
              </div>

              {/* My Profile */}
              <button onClick={() => setDropdownOpen(false)}
                style={{ width: "100%", background: "none", border: "none", padding: "11px 16px", display: "flex", alignItems: "center", gap: "9px", cursor: "pointer", fontSize: "14px", color: "#374151", fontFamily: "'Inter', sans-serif", fontWeight: 500, transition: "background 0.15s" }}
                onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
                onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
              >
                <User size={15} color="#64748b" /> My Profile
              </button>

              {/* Logout */}
              <button onClick={handleLogout}
                style={{ width: "100%", background: "none", border: "none", padding: "11px 16px", display: "flex", alignItems: "center", gap: "9px", cursor: "pointer", fontSize: "14px", color: "#ef4444", fontFamily: "'Inter', sans-serif", fontWeight: 500, borderTop: "1px solid #f1f5f9", transition: "background 0.15s" }}
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