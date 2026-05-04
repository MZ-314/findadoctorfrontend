import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { useAuth, getInitials } from "../context/AuthContext";
import api, { getApiErrorMessage } from "../api/axios";

type Role = "patient" | "doctor" | "hospital_admin";

const NAV = "#0a2540";
const TEAL = "#00b4d8";

export function RegisterCard() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<Role>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [specialisation, setSpecialisation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [languages, setLanguages] = useState("");
  const [bio, setBio] = useState("");
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);

  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalCityId, setHospitalCityId] = useState<number | null>(null);
  const [hospitalBudgetTier, setHospitalBudgetTier] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [hospitalDescription, setHospitalDescription] = useState("");

  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [hospitals, setHospitals] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    api.get("/cities").then((r) => setCities(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCity) {
      api.get(`/hospitals?city_id=${selectedCity}`)
        .then((r) => setHospitals(r.data))
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
          specialisation, experience_years: parseInt(experienceYears) || 0,
          languages, bio, hospital_id: selectedHospital,
        });
        const res = await api.post("/auth/login", { email, password });
        login({ name, email, role: "doctor", initials: getInitials(name) }, res.data.access_token);
        navigate("/doctor");
      } else if (role === "hospital_admin") {
        if (!hospitalCityId) { setError("Please select a city."); setLoading(false); return; }
        if (!hospitalName || !hospitalAddress || !hospitalBudgetTier) {
          setError("Please fill in all required hospital fields."); setLoading(false); return;
        }
        await api.post("/auth/register", {
          name, email, password, role: "hospital_admin",
          hospital_name: hospitalName, hospital_city_id: hospitalCityId,
          hospital_address: hospitalAddress, hospital_budget_tier: hospitalBudgetTier,
          hospital_phone: hospitalPhone, hospital_description: hospitalDescription,
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

  const ROLE_LABELS = { patient: "Patient", doctor: "Doctor", hospital_admin: "Hospital Admin" };

  return (
    <div style={{
      width: "460px", borderRadius: "20px", background: "#ffffff",
      boxShadow: "0 24px 64px rgba(10,37,64,0.32)",
      padding: "44px 40px", fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: NAV, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="7.5" y="1" width="5" height="18" rx="2" fill={TEAL} />
            <rect x="1" y="7.5" width="18" height="5" rx="2" fill="white" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "20px", color: NAV, letterSpacing: "-0.5px", lineHeight: 1 }}>Docfolio</div>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 500, letterSpacing: "0.5px" }}>by SETV Healthcare</div>
        </div>
      </div>

      <h1 style={{ fontWeight: 700, fontSize: "20px", color: "#1e293b", margin: "0 0 20px" }}>Create your account</h1>

      {/* Role toggle */}
      <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "12px", padding: "4px", marginBottom: "24px", gap: "4px" }}>
        {(["patient", "doctor", "hospital_admin"] as const).map((r) => {
          const active = role === r;
          return (
            <button key={r} type="button" onClick={() => { setRole(r); setError(""); }}
              style={{
                flex: 1, padding: "9px 4px", borderRadius: "9px", border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: "11.5px",
                background: active ? NAV : "transparent",
                color: active ? "#ffffff" : "#64748b",
                transition: "all 0.2s",
                boxShadow: active ? "0 2px 8px rgba(10,37,64,0.25)" : "none",
              }}
            >
              {ROLE_LABELS[r]}
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#dc2626", fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <Field label="Full name">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="John Doe" required style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = TEAL)}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
        </Field>

        <Field label="Email address">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = TEAL)}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
        </Field>

        <Field label="Password">
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password" required
              style={{ ...inputStyle, paddingRight: "42px" }}
              onFocus={(e) => (e.target.style.borderColor = TEAL)}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: "2px" }}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        {role === "doctor" && (
          <>
            <Field label="Specialisation">
              <input value={specialisation} onChange={(e) => setSpecialisation(e.target.value)}
                placeholder="e.g. Cardiologist" required style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = TEAL)}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </Field>
            <Field label="Years of experience">
              <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="e.g. 5" min="0" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = TEAL)}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </Field>
            <Field label="Languages spoken">
              <input value={languages} onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. English, Hindi, Assamese" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = TEAL)}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </Field>
            <Field label="Bio (optional)">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                placeholder="Brief description about yourself..." rows={2}
                style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
            <Field label="City">
              <select value={selectedCity ?? ""} onChange={(e) => setSelectedCity(Number(e.target.value))}
                required style={selectStyle}>
                <option value="">Select your city</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Hospital">
              <select value={selectedHospital ?? ""} onChange={(e) => setSelectedHospital(Number(e.target.value))}
                required disabled={!selectedCity} style={selectStyle}>
                <option value="">{selectedCity ? "Select your hospital" : "Select a city first"}</option>
                {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </Field>
          </>
        )}

        {role === "hospital_admin" && (
          <>
            <Field label="Hospital name">
              <input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. City Care Hospital" required style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = TEAL)}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </Field>
            <Field label="City">
              <select value={hospitalCityId ?? ""} onChange={(e) => setHospitalCityId(Number(e.target.value))}
                required style={selectStyle}>
                <option value="">Select your city</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Address">
              <input value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)}
                placeholder="Full hospital address" required style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = TEAL)}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </Field>
            <Field label="Budget tier">
              <select value={hospitalBudgetTier} onChange={(e) => setHospitalBudgetTier(e.target.value)}
                required style={selectStyle}>
                <option value="">Select budget tier</option>
                <option value="low">Low — affordable, basic care</option>
                <option value="medium">Medium — standard facilities</option>
                <option value="high">High — premium facilities</option>
              </select>
            </Field>
            <Field label="Phone number (optional)">
              <input value={hospitalPhone} onChange={(e) => setHospitalPhone(e.target.value)}
                placeholder="+91 98765 43210" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = TEAL)}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </Field>
            <Field label="Description (optional)">
              <textarea value={hospitalDescription} onChange={(e) => setHospitalDescription(e.target.value)}
                placeholder="Brief description of your hospital..." rows={2}
                style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "10px", padding: "10px 14px", fontSize: "12.5px", color: "#92400e" }}>
              Your hospital will be visible after our team verifies and approves it.
            </div>
          </>
        )}

        <button type="submit" disabled={loading} style={{
          width: "100%", background: loading ? "#1a3a5c" : NAV, color: "#ffffff",
          fontWeight: 700, fontSize: "15px", border: "none", borderRadius: "10px",
          padding: "13px 0", cursor: loading ? "not-allowed" : "pointer", marginTop: "4px",
          boxShadow: "0 4px 16px rgba(10,37,64,0.3)", transition: "background 0.18s",
        }}>
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "22px 0 18px" }}>
        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>or</span>
        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
      </div>

      <p style={{ fontSize: "14px", color: "#64748b", margin: 0, textAlign: "center" }}>
        Already have an account?{" "}
        <Link to="/" style={{ color: TEAL, fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontSize: "14px", color: "#1e293b", background: "#f8fafc",
  border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "11px 14px",
  outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.18s",
};
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer", appearance: "none" };