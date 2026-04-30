import { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, Star, Sparkles, ChevronRight, Wallet } from "lucide-react";
import { useNavigate } from "react-router";
import api, { getApiErrorMessage } from "../../api/axios";

// ─── Types ───────────────────────────────────────────────────────────────────

interface City { id: number; name: string; }
interface Hospital { id: number; name: string; city_id: number; budget_tier: string; }
interface Doctor {
  id: number;
  name: string;
  specialisation: string;
  experience_years: number;
  availability: string;
  avg_rating: number;
  review_count: number;
  consultation_fee: number;
  hospital_name?: string;
  city_name?: string;
  languages?: string;
}

const AVAILABILITY_CONFIG: Record<string, { dot: string; label: string; bg: string; text: string }> = {
  green:  { dot: "#22c55e", label: "Available",       bg: "#f0fdf4", text: "#16a34a" },
  yellow: { dot: "#f59e0b", label: "Available Soon",  bg: "#fffbeb", text: "#d97706" },
  red:    { dot: "#ef4444", label: "Not Available",   bg: "#fef2f2", text: "#dc2626" },
};

const BUDGET_LABELS: Record<string, string> = { low: "Budget", medium: "Mid-range", high: "Premium" };

// ─── Doctor Card ─────────────────────────────────────────────────────────────

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const navigate = useNavigate();
  const avail = AVAILABILITY_CONFIG[doctor.availability] ?? AVAILABILITY_CONFIG.green;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(`/patient/doctor/${doctor.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "22px 20px 18px",
        boxShadow: hovered
          ? "0 8px 32px rgba(255,77,77,0.18), 0 2px 10px rgba(255,77,77,0.10)"
          : "0 4px 24px rgba(255,77,77,0.08), 0 1px 6px rgba(255,77,77,0.05)",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#ffe5e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "18px", color: "#ff4d4d", flexShrink: 0 }}>
          {doctor.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {doctor.name}
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>{doctor.specialisation}</div>
        </div>
      </div>

      {/* Availability badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: avail.bg, borderRadius: "20px", padding: "4px 10px", width: "fit-content" }}>
        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: avail.dot }} />
        <span style={{ fontSize: "11.5px", fontWeight: 600, color: avail.text }}>{avail.label}</span>
      </div>

      {/* Info pills */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {doctor.hospital_name && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6b7280" }}>
            <Briefcase size={12} color="#9ca3af" strokeWidth={2} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doctor.hospital_name}</span>
          </div>
        )}
        {doctor.city_name && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6b7280" }}>
            <MapPin size={12} color="#9ca3af" strokeWidth={2} />
            {doctor.city_name}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px", paddingTop: "12px", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Star size={13} fill="#ff4d4d" stroke="none" />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{doctor.avg_rating?.toFixed(1) ?? "N/A"}</span>
          <span style={{ fontSize: "11.5px", color: "#9ca3af" }}>({doctor.review_count})</span>
        </div>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#ff4d4d" }}>₹{doctor.consultation_fee}</span>
      </div>
    </div>
  );
}

// ─── AI Result Card ───────────────────────────────────────────────────────────

function AIResultSection({ result, onDismiss }: { result: any; onDismiss: () => void }) {
  const navigate = useNavigate();
  return (
    <div style={{ background: "linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)", border: "2px solid #fecaca", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={18} color="#ff4d4d" />
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>AI Recommendation</span>
          <span style={{ background: "#ffe5e5", color: "#ff4d4d", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>
            {result.suggested_specialisation}
          </span>
        </div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#9ca3af", lineHeight: 1 }}>×</button>
      </div>
      <p style={{ fontSize: "13.5px", color: "#6b7280", lineHeight: 1.6, margin: "0 0 18px", padding: "12px 14px", background: "#f9fafb", borderRadius: "10px", borderLeft: "3px solid #fecaca" }}>
        {result.explanation}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
        {result.recommended_doctors?.map((doc: Doctor) => (
          <DoctorCard key={doc.id} doctor={doc} />
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PatientHome() {
  const [cities, setCities] = useState<City[]>([]);
  const [specialisations, setSpecialisations] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  const [cityId, setCityId] = useState("");
  const [spec, setSpec] = useState("");
  const [budget, setBudget] = useState("");
  const [availability, setAvailability] = useState("");
  const [search, setSearch] = useState("");

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState("");

  // Load cities + specialisations on mount
  useEffect(() => {
    api.get("/cities").then((r) => setCities(r.data));
    api.get("/specialisations").then((r) => setSpecialisations(r.data));
  }, []);

  // Fetch doctors whenever filters change
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (cityId) params.city_id = cityId;
    if (spec) params.specialisation = spec;
    if (budget) params.budget = budget;
    if (availability) params.availability_pref = availability;
    api
      .get("/doctors", { params })
      .then((r) => setDoctors(r.data))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, [cityId, spec, budget, availability]);

  const handleAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiError("");
    setAiLoading(true);
    setAiResult(null);
    try {
      const body: any = { problem_description: aiQuery };
      if (cityId) body.city_id = parseInt(cityId);
      const r = await api.post("/ai/recommend", body);
      setAiResult(r.data);
    } catch (err: any) {
      setAiError(getApiErrorMessage(err, "AI recommendation failed."));
    } finally {
      setAiLoading(false);
    }
  };

  const filtered = doctors.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialisation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 40px 64px" }}>

      {/* Hero */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "28px", color: "#111827", margin: "0 0 6px" }}>Find the right doctor</h1>
        <p style={{ fontSize: "15px", color: "#9ca3af", margin: 0 }}>Search verified specialists across India — or describe your symptoms for an AI-powered match.</p>
      </div>

      {/* AI Recommend Box */}
      <div style={{ background: "linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%)", border: "1.5px solid #fecaca", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Sparkles size={18} color="#ff4d4d" />
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>AI Doctor Recommendation</span>
        </div>
        <p style={{ fontSize: "13px", color: "#9ca3af", margin: "0 0 14px" }}>Describe your symptoms in plain language and our AI will suggest the right specialists.</p>
        <form onSubmit={handleAI} style={{ display: "flex", gap: "10px" }}>
          <input
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g. I've been having chest pain and shortness of breath for a week…"
            style={{ flex: 1, fontSize: "14px", color: "#111827", background: "#ffffff", border: "1.5px solid #fecaca", borderRadius: "10px", padding: "11px 14px", outline: "none", fontFamily: "'Inter', sans-serif" }}
            onFocus={(e) => (e.target.style.borderColor = "#ff4d4d")}
            onBlur={(e) => (e.target.style.borderColor = "#fecaca")}
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuery.trim()}
            style={{ background: aiLoading ? "#fca5a5" : "#ff4d4d", color: "#ffffff", border: "none", borderRadius: "10px", padding: "11px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.18s" }}
          >
            {aiLoading ? "Thinking…" : "Recommend"}
          </button>
        </form>
        {aiError && <div style={{ marginTop: "10px", fontSize: "13px", color: "#dc2626", fontWeight: 500 }}>{aiError}</div>}
      </div>

      {/* AI Result */}
      {aiResult && <AIResultSection result={aiResult} onDismiss={() => setAiResult(null)} />}

      {/* Filters */}
      <div style={{ background: "#ffffff", borderRadius: "14px", padding: "18px 20px", marginBottom: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search size={15} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or specialisation…"
            style={{ width: "100%", fontSize: "13px", color: "#111827", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: "9px", padding: "9px 12px 9px 34px", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" }} />
        </div>

        <Select icon={<MapPin size={13} />} value={cityId} onChange={setCityId} placeholder="All Cities">
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>

        <Select icon={<Briefcase size={13} />} value={spec} onChange={setSpec} placeholder="All Specialisations">
          {specialisations.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>

        <Select icon={<Wallet size={13} />} value={budget} onChange={setBudget} placeholder="Any Budget">
          <option value="low">Budget (₹400)</option>
          <option value="medium">Mid-range (₹900)</option>
          <option value="high">Premium (₹2500)</option>
        </Select>

        <Select value={availability} onChange={setAvailability} placeholder="Any Availability">
          <option value="green">Available Now</option>
          <option value="yellow">Available Soon</option>
        </Select>

        {(cityId || spec || budget || availability || search) && (
          <button onClick={() => { setCityId(""); setSpec(""); setBudget(""); setAvailability(""); setSearch(""); }}
            style={{ fontSize: "12px", color: "#ff4d4d", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "4px 0", whiteSpace: "nowrap" }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Results header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontWeight: 700, fontSize: "18px", color: "#111827", margin: 0 }}>
          {loading ? "Loading…" : `${filtered.length} doctor${filtered.length !== 1 ? "s" : ""} found`}
        </h2>
      </div>

      {/* Doctor grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: "14px" }}>Loading doctors…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: "14px" }}>No doctors found. Try adjusting your filters.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "18px" }}>
          {filtered.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
        </div>
      )}
    </main>
  );
}

// ─── Reusable Select ──────────────────────────────────────────────────────────

function Select({ icon, value, onChange, placeholder, children }: {
  icon?: React.ReactNode; value: string; onChange: (v: string) => void;
  placeholder: string; children: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative", flex: "1 1 140px" }}>
      {icon && <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>{icon}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", fontSize: "13px", color: value ? "#111827" : "#9ca3af", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: "9px", padding: `9px 12px 9px ${icon ? "28px" : "12px"}`, outline: "none", appearance: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" }}>
        <option value="">{placeholder}</option>
        {children}
      </select>
    </div>
  );
}