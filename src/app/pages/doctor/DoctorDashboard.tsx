import { useState, useEffect } from "react";
import { Stethoscope, Clock, Star, Building2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

export function DoctorDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ availability: "green", available_from: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    api.get("/doctor/me")
      .then((r) => {
        setProfile(r.data);
        setForm({
          availability: r.data.availability,
          available_from: r.data.available_from ?? "",
        });
      })
      .catch((e) => setError(getApiErrorMessage(e, "Failed to load profile")))
      .finally(() => setLoading(false));
  }, []);

  const handleAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      await api.put("/doctor/me", {
        availability: form.availability,
        available_from: form.availability === "yellow" ? form.available_from : null,
      });
      setMsg({ type: "success", text: "Availability updated successfully!" });
    } catch (err: any) {
      setMsg({ type: "error", text: getApiErrorMessage(err, "Update failed") });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={centerStyle}>Loading...</div>;
  if (error) return <div style={{ ...centerStyle, color: "#dc2626" }}>{error}</div>;

  const statusColor = { green: "#22c55e", yellow: "#f59e0b", red: "#ef4444" };
  const statusLabel = { green: "Available Now", yellow: "Busy", red: "On Leave" };

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 40px 64px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>
          Doctor Dashboard
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
          Manage your profile and availability
        </p>
      </div>

      {/* Verification status banner */}
      {profile?.verification_status !== "approved" && (
        <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: "12px", padding: "14px 18px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={18} color="#d97706" />
          <span style={{ fontSize: "14px", color: "#92400e", fontWeight: 500 }}>
            {profile?.verification_status === "pending"
              ? "Your profile is pending verification by the hospital admin. You won't appear in search results until approved."
              : `Your profile was rejected. Reason: ${profile?.rejection_reason ?? "No reason provided"}`}
          </span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        {/* Profile card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
            <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#ffe5e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "20px", color: "#ff4d4d" }}>
              {profile?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>{profile?.name}</div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>{profile?.specialisation}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <InfoRow icon={<Stethoscope size={14} />} label="Experience" value={`${profile?.experience_years} years`} />
            <InfoRow icon={<Building2 size={14} />} label="Hospital" value={profile?.hospital?.name ?? "No hospital"} />
            <InfoRow icon={<Star size={14} />} label="Rating" value={`${profile?.avg_rating?.toFixed(1)} (${profile?.review_count} reviews)`} />
            <InfoRow icon={<Clock size={14} />} label="Fee" value={`₹${profile?.consultation_fee}`} />
          </div>
        </div>

        {/* Availability card */}
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 700, fontSize: "15px", color: "#111827", margin: "0 0 16px" }}>
            Update Availability
          </h3>
          {msg.text && (
            <div style={{ background: msg.type === "error" ? "#fef2f2" : "#f0fdf4", border: `1.5px solid ${msg.type === "error" ? "#fecaca" : "#bbf7d0"}`, borderRadius: "8px", padding: "9px 12px", marginBottom: "14px", fontSize: "13px", color: msg.type === "error" ? "#dc2626" : "#16a34a", fontWeight: 500 }}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleAvailability} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Status</label>
              <select
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value, available_from: "" })}
                style={selectStyle}
              >
                <option value="green">🟢 Available Now</option>
                <option value="yellow">🟡 Busy (set a time)</option>
                <option value="red">🔴 On Leave</option>
              </select>
            </div>
            {form.availability === "yellow" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Available From</label>
                <input
                  required
                  value={form.available_from}
                  onChange={(e) => setForm({ ...form, available_from: e.target.value })}
                  placeholder="e.g. 3:00 PM"
                  style={inputStyle}
                />
              </div>
            )}
            <button type="submit" disabled={saving} style={btnStyle}>
              {saving ? "Saving…" : "Update Status"}
            </button>
          </form>
        </div>
      </div>

      {/* Bio & Education */}
      <div style={cardStyle}>
        <h3 style={{ fontWeight: 700, fontSize: "15px", color: "#111827", margin: "0 0 14px" }}>Profile Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginBottom: "4px" }}>Education</div>
            <div style={{ fontSize: "14px", color: "#374151" }}>{profile?.education || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginBottom: "4px" }}>Languages</div>
            <div style={{ fontSize: "14px", color: "#374151" }}>{Array.isArray(profile?.languages) ? profile.languages.join(", ") : profile?.languages || "—"}</div>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginBottom: "4px" }}>Bio</div>
            <div style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6 }}>{profile?.bio || "—"}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
      <span style={{ color: "#9ca3af" }}>{icon}</span>
      <span style={{ color: "#6b7280", minWidth: "80px" }}>{label}</span>
      <span style={{ color: "#111827", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const centerStyle: React.CSSProperties = { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "14px" };
const cardStyle: React.CSSProperties = { background: "#ffffff", borderRadius: "16px", padding: "22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" };
const labelStyle: React.CSSProperties = { fontSize: "13px", fontWeight: 500, color: "#374151" };
const inputStyle: React.CSSProperties = { fontSize: "14px", color: "#111827", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer", appearance: "none" };
const btnStyle: React.CSSProperties = { background: "#ff4d4d", color: "#ffffff", border: "none", borderRadius: "10px", padding: "11px 0", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px", cursor: "pointer", width: "100%", boxShadow: "0 2px 10px rgba(255,77,77,0.22)" };