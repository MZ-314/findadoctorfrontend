import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { useAuth, getInitials } from "../context/AuthContext";
import api, { getApiErrorMessage } from "../api/axios";

export function RegisterCard() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
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
      // Register
      await api.post("/auth/register", { name, email, password, role: "patient" });

      // Auto-login after registration
      const res = await api.post("/auth/login", { email, password });
      const { access_token } = res.data;

      login(
        { name, email, role: "patient", initials: getInitials(name) },
        access_token
      );
      navigate("/patient");
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "420px",
        borderRadius: "16px",
        background: "#ffffff",
        boxShadow: "0 8px 40px rgba(255,77,77,0.18), 0 2px 12px rgba(255,77,77,0.10)",
        padding: "40px",
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#ff4d4d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="7" y="1" width="4" height="16" rx="1.5" fill="white" />
            <rect x="1" y="7" width="16" height="4" rx="1.5" fill="white" />
          </svg>
        </div>
        <span style={{ color: "#ff4d4d", fontWeight: 700, fontSize: "20px", letterSpacing: "-0.4px" }}>FindADoctor</span>
      </div>

      <h1 style={{ fontWeight: 700, fontSize: "22px", color: "#111827", margin: "0 0 4px" }}>Create an account</h1>
      <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 8px" }}>Register as a patient to book appointments</p>

      <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "10px", padding: "10px 14px", marginBottom: "24px", fontSize: "13px", color: "#92400e" }}>
        <strong>Are you a doctor?</strong> Doctors are registered by their hospital admin. Contact your hospital to get added.
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#dc2626", fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Full name</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="John Doe" required style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>

        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Email address</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>

        {/* Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password" required
              style={{ ...inputStyle, paddingRight: "42px" }}
              onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", padding: "2px" }}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          style={{
            width: "100%", background: loading ? "#fca5a5" : "#ff4d4d", color: "#ffffff",
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "15px",
            border: "none", borderRadius: "10px", padding: "13px 0",
            cursor: loading ? "not-allowed" : "pointer", marginTop: "4px",
            boxShadow: "0 2px 12px rgba(255,77,77,0.22)", transition: "background 0.18s",
          }}
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "22px 0 18px" }}>
        <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>or</span>
        <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
      </div>

      <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, textAlign: "center" }}>
        Already have an account?{" "}
        <Link to="/" style={{ color: "#ff4d4d", fontWeight: 600, textDecoration: "none" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "13px", fontWeight: 500, color: "#374151", fontFamily: "'Inter', sans-serif",
};

const inputStyle: React.CSSProperties = {
  fontSize: "14px", color: "#111827", background: "#f9fafb",
  border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "11px 14px",
  outline: "none", width: "100%", boxSizing: "border-box",
  fontFamily: "'Inter', sans-serif", transition: "border-color 0.18s",
};