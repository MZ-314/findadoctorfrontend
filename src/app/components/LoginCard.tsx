import { useState } from "react";
import { Eye, EyeOff, User, Stethoscope, Building2 } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { useAuth, getInitials } from "../context/AuthContext";
import api, { getApiErrorMessage } from "../api/axios";

type Tab = "patient" | "doctor" | "hospital_admin";

const NAV = "#0a2540";
const TEAL = "#00b4d8";

export function LoginCard() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [tab, setTab] = useState<Tab>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { access_token } = res.data;
      if (!access_token) throw new Error("Missing access token");

      localStorage.setItem("token", access_token);
      const meRes = await api.get("/auth/me");
      const me = meRes.data;

      login({
        id: me.id,
        name: me.name,
        email: me.email,
        role: me.role,
        initials: getInitials(me.name),
      }, access_token);

      if (me.role === "patient") navigate("/patient");
      else if (me.role === "doctor") navigate("/doctor");
      else if (me.role === "hospital_admin") navigate("/hospital");
      else navigate("/");
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "patient",       label: "Patient",       icon: <User size={14} strokeWidth={2.2} /> },
    { key: "doctor",        label: "Doctor",        icon: <Stethoscope size={14} strokeWidth={2.2} /> },
    { key: "hospital_admin",label: "Hospital Admin",icon: <Building2 size={14} strokeWidth={2.2} /> },
  ];

  return (
    <div style={{
      width: "420px",
      padding: "44px 40px",
      borderRadius: "20px",
      background: "#ffffff",
      boxShadow: "0 24px 64px rgba(10,37,64,0.32)",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: NAV, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="8.5" y="1" width="5" height="20" rx="2" fill={TEAL} />
              <rect x="1" y="8.5" width="20" height="5" rx="2" fill="white" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "22px", color: NAV, letterSpacing: "-0.5px", lineHeight: 1 }}>Docfolio</div>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 500, letterSpacing: "0.5px" }}>by SETV Healthcare</div>
          </div>
        </div>
      </div>

      <h1 style={{ fontWeight: 700, fontSize: "20px", color: "#1e293b", textAlign: "center", margin: "0 0 4px" }}>
        Welcome back
      </h1>
      <p style={{ fontSize: "13.5px", color: "#94a3b8", textAlign: "center", margin: "0 0 24px" }}>
        Sign in to your Docfolio account
      </p>

      {/* Role tabs */}
      <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "12px", padding: "4px", marginBottom: "24px", gap: "4px" }}>
        {TABS.map(({ key, label, icon }) => {
          const active = tab === key;
          return (
            <button key={key} type="button"
              onClick={() => { setTab(key); setError(""); setEmail(""); setPassword(""); }}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: "5px", padding: "9px 4px", borderRadius: "9px", border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: "11.5px",
                background: active ? NAV : "transparent",
                color: active ? "#ffffff" : "#64748b",
                transition: "all 0.2s",
                boxShadow: active ? "0 2px 8px rgba(10,37,64,0.25)" : "none",
              }}
            >
              {icon} {label}
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#dc2626", fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Email address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = TEAL)}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" required
              style={{ ...inputStyle, paddingRight: "42px" }}
              onFocus={(e) => (e.target.style.borderColor = TEAL)}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: "2px" }}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          style={{
            width: "100%", background: loading ? "#1a3a5c" : NAV, color: "#ffffff",
            fontWeight: 700, fontSize: "15px", border: "none", borderRadius: "10px",
            padding: "13px 0", cursor: loading ? "not-allowed" : "pointer",
            marginTop: "4px", boxShadow: "0 4px 16px rgba(10,37,64,0.3)",
            transition: "background 0.18s", letterSpacing: "0.2px",
          }}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0 20px" }}>
        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>or</span>
        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
      </div>

      <p style={{ fontSize: "14px", color: "#64748b", textAlign: "center", margin: 0 }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: TEAL, fontWeight: 600 }}>Register</Link>
      </p>

      <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", marginTop: "20px" }}>
        Are you a Docfolio staff member?{" "}
        <a href="https://docfolio-staff.vercel.app" style={{ color: "#64748b", fontWeight: 600 }}>
          Staff Portal →
        </a>
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "13px", fontWeight: 500, color: "#374151",
};
const inputStyle: React.CSSProperties = {
  fontSize: "14px", color: "#1e293b", background: "#f8fafc",
  border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "11px 14px",
  outline: "none", width: "100%", boxSizing: "border-box",
  transition: "border-color 0.18s",
};