import { useState, useEffect } from "react";
import { UserX, Stethoscope } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

export function HospitalDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/hospital/doctors")
      .then((r) => setDoctors(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (id: number, name: string) => {
    if (!confirm(`Remove ${name} from your hospital? They will need to re-apply.`)) return;
    try {
      await api.delete(`/hospital/doctors/${id}/remove`);
      load();
    } catch (e: any) {
      alert(getApiErrorMessage(e));
    }
  };

  if (loading) return <div style={centerStyle}>Loading…</div>;

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 40px 64px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>Our Doctors</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>{doctors.length} approved doctors</p>
      </div>

      {doctors.length === 0 ? (
        <div style={emptyStyle}>No approved doctors yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {doctors.map((d) => (
            <div key={d.id} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#ffe5e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "15px", color: "#ff4d4d" }}>
                  {d.user?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "15px", color: "#111827" }}>{d.user?.name}</div>
                  <div style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Stethoscope size={12} /> {d.specialisation} · {d.experience_years} yrs · ₹{d.consultation_fee}
                  </div>
                </div>
              </div>
              <button onClick={() => handleRemove(d.id, d.user?.name)} style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>
                <UserX size={14} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const centerStyle: React.CSSProperties = { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "14px" };
const emptyStyle: React.CSSProperties = { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "14px", background: "#ffffff", borderRadius: "16px", border: "1px solid #f3f4f6" };
const cardStyle: React.CSSProperties = { background: "#ffffff", borderRadius: "16px", padding: "18px 22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" };