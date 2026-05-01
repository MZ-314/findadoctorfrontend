import { useState } from "react";
import { Eye, EyeOff, User, Stethoscope, Shield } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { useAuth, getInitials } from "../context/AuthContext";
import api, { getApiErrorMessage } from "../api/axios";

type Tab = "patient" | "doctor" | "staff";

export function LoginCard() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [tab, setTab] = useState<Tab>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "staff") {
        // Staff login uses username + password
        const res = await api.post("/auth/staff/login", { username, password });
        const { access_token } = res.data;
        if (!access_token || typeof access_token !== "string") {
          throw new Error("Login failed: missing access token.");
        }
        // Decode basic info from token payload
        const tokenParts = access_token.split(".");
        if (tokenParts.length < 2) {
          throw new Error("Login failed: invalid access token.");
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        login(
          {
            name: `Staff (${payload.city ?? "Unknown City"})`,
            email: username,
            role: "staff",
            initials: "ST",
          },
          access_token
        );
        navigate("/staff");
      } else {
        // Patient / Doctor login
        const res = await api.post("/auth/login", { email, password });
        const { access_token } = res.data;
        if (!access_token || typeof access_token !== "string") {
          throw new Error("Login failed: missing access token.");
        }

        // Fetch user profile to get name + role
        // Save token first so the interceptor picks it up
        localStorage.setItem("token", access_token);
        const meRes = await api.get("/auth/me");
        const me = meRes.data;

        login(
          {
            id: me.id,
            name: me.name,
            email: me.email,
            role: me.role,
            initials: getInitials(me.name),
          },
          access_token
        );

        if (me.role === "patient") navigate("/patient");
        else if (me.role === "doctor") navigate("/doctor");
        else if (me.role === "hospital_admin") navigate("/hospital");
        else navigate("/");
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "patient", label: "Patient", icon: <User size={14} strokeWidth={2.2} /> },
    { key: "doctor", label: "Doctor", icon: <Stethoscope size={14} strokeWidth={2.2} /> },
    { key: "staff", label: "Staff", icon: <Shield size={14} strokeWidth={2.2} /> },
  ];

  return (
    <div
      style={{
        width: "400px",
        padding: "40px",
        borderRadius: "16px",
        background: "#ffffff",
        boxShadow: "0 8px 40px rgba(255,77,77,0.18), 0 2px 12px rgba(255,77,77,0.10)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#ff4d4d", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect x="10" y="2" width="6" height="22" rx="2" fill="white" />
            <rect x="2" y="10" width="22" height="6" rx="2" fill="white" />
          </svg>
        </div>
        <span style={{ color: "#ff4d4d", fontWeight: 700, fontSize: "22px", letterSpacing: "-0.5px" }}>
          FindADoctor
        </span>
      </div>

      <h1 style={{ fontWeight: 700, fontSize: "22px", color: "#111827", textAlign: "center", margin: "0 0 6px" }}>
        Welcome back
      </h1>
      <p style={{ fontSize: "14px", color: "#9ca3af", textAlign: "center", margin: "0 0 24px" }}>
        Sign in to continue
      </p>

      {/* Role toggle — 3 tabs */}
      <div style={{ display: "flex", background: "#ffe5e5", borderRadius: "12px", padding: "4px", marginBottom: "24px", gap: "4px" }}>
        {TABS.map(({ key, label, icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setError(""); }}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: "6px", padding: "9px 0", borderRadius: "9px", border: "none",
                cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600,
                fontSize: "12px", background: active ? "#ff4d4d" : "transparent",
                color: active ? "#ffffff" : "#ff4d4d", transition: "background 0.2s, color 0.2s",
                boxShadow: active ? "0 2px 10px rgba(255,77,77,0.22)" : "none",
              }}
            >
              {icon} {label}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#dc2626", fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {tab === "staff" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="staff_guwahati"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ ...inputStyle, paddingRight: "42px" }}
              onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", padding: "2px" }}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", background: loading ? "#fca5a5" : "#ff4d4d", color: "#ffffff",
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "15px",
            border: "none", borderRadius: "10px", padding: "13px 0", cursor: loading ? "not-allowed" : "pointer",
            marginTop: "4px", boxShadow: "0 2px 12px rgba(255,77,77,0.22)", transition: "background 0.18s",
          }}
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>

      {tab !== "staff" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0 20px" }}>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          </div>
          <p style={{ fontSize: "14px", color: "#6b7280", textAlign: "center", margin: 0 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#ff4d4d", fontWeight: 600, textDecoration: "none" }}>
              Register
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontSize: "14px", color: "#111827", background: "#f9fafb",
  border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "11px 14px",
  outline: "none", width: "100%", boxSizing: "border-box",
  fontFamily: "'Inter', sans-serif", transition: "border-color 0.18s",
};