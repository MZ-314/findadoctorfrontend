import { useState, useEffect } from "react";
import { Building2, Phone, Mail, Globe, MapPin } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

export function HospitalDashboard() {
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    api.get("/hospital/me")
      .then((r) => { setHospital(r.data); setForm(r.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      await api.put("/hospital/me", {
        name: form.name,
        address: form.address,
        description: form.description,
        phone: form.phone,
        email: form.email,
        website: form.website,
      });
      setMsg({ type: "success", text: "Hospital profile updated!" });
      setEditing(false);
      setHospital({ ...hospital, ...form });
    } catch (err: any) {
      setMsg({ type: "error", text: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={centerStyle}>Loading…</div>;

  const verificationColor = { approved: "#16a34a", pending: "#d97706", rejected: "#dc2626" };
  const verificationBg = { approved: "#f0fdf4", pending: "#fffbeb", rejected: "#fef2f2" };
  const vs = hospital?.verification_status ?? "pending";

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 40px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>Hospital Dashboard</h1>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>Manage your hospital profile</p>
        </div>
        <span style={{ background: verificationBg[vs as keyof typeof verificationBg], color: verificationColor[vs as keyof typeof verificationColor], fontSize: "12px", fontWeight: 700, padding: "5px 12px", borderRadius: "20px" }}>
          {vs.charAt(0).toUpperCase() + vs.slice(1)}
        </span>
      </div>

      {msg.text && (
        <div style={{ background: msg.type === "error" ? "#fef2f2" : "#f0fdf4", border: `1.5px solid ${msg.type === "error" ? "#fecaca" : "#bbf7d0"}`, borderRadius: "10px", padding: "10px 14px", marginBottom: "20px", fontSize: "13px", color: msg.type === "error" ? "#dc2626" : "#16a34a", fontWeight: 500 }}>
          {msg.text}
        </div>
      )}

      <div style={cardStyle}>
        {!editing ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: "20px", color: "#111827", margin: "0 0 4px" }}>{hospital?.name}</h2>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#ff4d4d", background: "#ffe5e5", padding: "2px 10px", borderRadius: "20px" }}>
                  {hospital?.budget_tier?.charAt(0).toUpperCase() + hospital?.budget_tier?.slice(1)}
                </span>
              </div>
              <button onClick={() => setEditing(true)} style={editBtnStyle}>Edit Profile</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {hospital?.address && <InfoRow icon={<MapPin size={14} />} value={hospital.address} />}
              {hospital?.phone && <InfoRow icon={<Phone size={14} />} value={hospital.phone} />}
              {hospital?.email && <InfoRow icon={<Mail size={14} />} value={hospital.email} />}
              {hospital?.website && <InfoRow icon={<Globe size={14} />} value={hospital.website} />}
            </div>
            {hospital?.description && (
              <div style={{ marginTop: "16px", padding: "14px", background: "#f9fafb", borderRadius: "10px", fontSize: "14px", color: "#374151", lineHeight: 1.6 }}>
                {hospital.description}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontWeight: 700, fontSize: "15px", color: "#111827", margin: "0 0 4px" }}>Edit Hospital Profile</h3>
            {[
              { label: "Hospital Name", key: "name" },
              { label: "Address", key: "address" },
              { label: "Phone", key: "phone" },
              { label: "Email", key: "email" },
              { label: "Website", key: "website" },
            ].map(({ label, key }) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={labelStyle}>{label}</label>
                <input value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" disabled={saving} style={btnStyle}>{saving ? "Saving…" : "Save Changes"}</button>
              <button type="button" onClick={() => setEditing(false)} style={cancelBtnStyle}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

function InfoRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#6b7280" }}>
      <span style={{ color: "#9ca3af" }}>{icon}</span>
      {value}
    </div>
  );
}

const centerStyle: React.CSSProperties = { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "14px" };
const cardStyle: React.CSSProperties = { background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" };
const labelStyle: React.CSSProperties = { fontSize: "13px", fontWeight: 500, color: "#374151" };
const inputStyle: React.CSSProperties = { fontSize: "14px", color: "#111827", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" };
const btnStyle: React.CSSProperties = { background: "#ff4d4d", color: "#ffffff", border: "none", borderRadius: "10px", padding: "11px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px", cursor: "pointer" };
const cancelBtnStyle: React.CSSProperties = { background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "10px", padding: "11px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px", cursor: "pointer" };
const editBtnStyle: React.CSSProperties = { background: "#fff5f5", color: "#ff4d4d", border: "1.5px solid #fecaca", borderRadius: "10px", padding: "8px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px", cursor: "pointer" };