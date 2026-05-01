import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { useAuth, getInitials } from "../context/AuthContext";
import api, { getApiErrorMessage } from "../api/axios";

type Role = "patient" | "doctor" | "hospital_admin";

export function RegisterCard() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Common fields
  const [role, setRole] = useState<Role>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Doctor fields
  const [specialisation, setSpecialisation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [languages, setLanguages] = useState("");
  const [bio, setBio] = useState("");
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);

  // Hospital admin fields
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalCityId, setHospitalCityId] = useState<number | null>(null);
  const [hospitalBudgetTier, setHospitalBudgetTier] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [hospitalDescription, setHospitalDescription] = useState("");

  // Shared data
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [hospitals, setHospitals] = useState<{ id: number; name: string }[]>([]);

  // Fetch cities on mount
  useEffect(() => {
    api.get("/cities").then((res) => setCities(res.data)).catch(() => {});
  }, []);

  // Fetch hospitals when doctor selects a city
  useEffect(() => {
    if (selectedCity) {
      api.get(`/hospitals?city_id=${selectedCity}`)
        .then((res) => setHospitals(res.data))
        .catch(() => setHospitals([]));
      setSelectedHospital(null);
    }
  }, [selectedCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (role === "patient") {
        await api.post("/auth/register", { name, email, password, role: "patient" });
        const res = await api.post("/auth/login", { email, password });
        login({ name, email, role: "patient", initials: getInitials(name) }, res.data.access_token);
        navigate("/patient");

      } else if (role === "doctor") {
        if (!selectedCity) { setError("Please select a city."); setLoading(false); return; }
        if (!selectedHospital) { setError("Please select a hospital."); setLoading(false); return; }
        if (!specialisation) { setError("Please enter your specialisation."); setLoading(false); return; }

        await api.post("/auth/register", {
          name, email, password, role: "doctor",
          specialisation,
          experience_years: parseInt(experienceYears) || 0,
          languages,
          bio,
          hospital_id: selectedHospital,
        });
        const res = await api.post("/auth/login", { email, password });
        login({ name, email, role: "doctor", initials: getInitials(name) }, res.data.access_token);
        navigate("/doctor");

      } else if (role === "hospital_admin") {
        if (!hospitalCityId) { setError("Please select a city."); setLoading(false); return; }
        if (!hospitalName) { setError("Please enter your hospital name."); setLoading(false); return; }
        if (!hospitalAddress) { setError("Please enter your hospital address."); setLoading(false); return; }
        if (!hospitalBudgetTier) { setError("Please select a budget tier."); setLoading(false); return; }

        await api.post("/auth/register", {
          name, email, password, role: "hospital_admin",
          hospital_name: hospitalName,
          hospital_city_id: hospitalCityId,
          hospital_address: hospitalAddress,
          hospital_budget_tier: hospitalBudgetTier,
          hospital_phone: hospitalPhone,
          hospital_description: hospitalDescription,
        });
        const res = await api.post("/auth/login", { email, password });
        login({ name, email, role: "hospital_admin", initials: getInitials(name) }, res.data.access_token);
        navigate("/hospital");
      }

    } catch (err: any) {
      setError(getApiErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: "420px", borderRadius: "16px", background: "#ffffff",
      boxShadow: "0 8px 40px rgba(255,77,77,0.18), 0 2px 12px rgba(255,77,77,0.10)",
      padding: "40px", fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
    }}>
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

      <h1 style={{ fontWeight: 700, fontSize: "22px", color: "#111827", margin: "0 0 16px" }}>Create an account</h1>

      {/* Role toggle */}
      <div style={{ display: "flex", background: "#ffe5e5", borderRadius: "12px", padding: "4px", marginBottom: "24px", gap: "4px" }}>
        {(["patient", "doctor", "hospital_admin"] as const).map((r) => {
          const labels = { patient: "Patient", doctor: "Doctor", hospital_admin: "Hospital Admin" };
          const active = role === r;
          return (
            <button key={r} type="button" onClick={() => { setRole(r); setError(""); }}
              style={{
                flex: 1, padding: "9px 0", borderRadius: "9px", border: "none",
                cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600,
                fontSize: "12px", background: active ? "#ff4d4d" : "transparent",
                color: active ? "#ffffff" : "#ff4d4d", transition: "background 0.2s, color 0.2s",
                boxShadow: active ? "0 2px 10px rgba(255,77,77,0.22)" : "none",
              }}
            >
              {labels[r]}
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
        {/* Common fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Full name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="John Doe" required style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Email address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password" required
              style={{ ...inputStyle, paddingRight: "42px" }}
              onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", padding: "2px" }}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Doctor-specific fields */}
        {role === "doctor" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Specialisation</label>
              <input type="text" value={specialisation} onChange={(e) => setSpecialisation(e.target.value)}
                placeholder="e.g. Cardiologist" required style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Years of experience</label>
              <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="e.g. 5" min="0" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Languages spoken</label>
              <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. English, Hindi, Assamese" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Bio (optional)</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                placeholder="Brief description about yourself..." rows={3}
                style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>City</label>
              <select value={selectedCity ?? ""} onChange={(e) => setSelectedCity(Number(e.target.value))}
                required style={inputStyle}>
                <option value="">Select your city</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Hospital</label>
              <select value={selectedHospital ?? ""} onChange={(e) => setSelectedHospital(Number(e.target.value))}
                required disabled={!selectedCity} style={{ ...inputStyle, color: !selectedCity ? "#9ca3af" : "#111827" }}>
                <option value="">{selectedCity ? "Select your hospital" : "Select a city first"}</option>
                {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Hospital admin-specific fields */}
        {role === "hospital_admin" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Hospital name</label>
              <input type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. City Care Hospital" required style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>City</label>
              <select value={hospitalCityId ?? ""} onChange={(e) => setHospitalCityId(Number(e.target.value))}
                required style={inputStyle}>
                <option value="">Select your city</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Address</label>
              <input type="text" value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)}
                placeholder="Full hospital address" required style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Budget tier</label>
              <select value={hospitalBudgetTier} onChange={(e) => setHospitalBudgetTier(e.target.value)}
                required style={inputStyle}>
                <option value="">Select budget tier</option>
                <option value="low">Low — affordable, basic care</option>
                <option value="medium">Medium — standard facilities</option>
                <option value="high">High — premium facilities</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Phone number (optional)</label>
              <input type="text" value={hospitalPhone} onChange={(e) => setHospitalPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Description (optional)</label>
              <textarea value={hospitalDescription} onChange={(e) => setHospitalDescription(e.target.value)}
                placeholder="Brief description of your hospital..." rows={3}
                style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#92400e" }}>
              Your hospital will be visible to patients only after our team verifies and approves it.
            </div>
          </>
        )}

        <button type="submit" disabled={loading}
          style={{
            width: "100%", background: loading ? "#fca5a5" : "#ff4d4d", color: "#ffffff",
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "15px",
            border: "none", borderRadius: "10px", padding: "13px 0",
            cursor: loading ? "not-allowed" : "pointer", marginTop: "4px",
            boxShadow: "0 2px 12px rgba(255,77,77,0.22)", transition: "background 0.18s",
          }}>
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
        <Link to="/" style={{ color: "#ff4d4d", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
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