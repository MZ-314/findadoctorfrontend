import { useState, useEffect } from "react";
import { Stethoscope, Building2 } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

export function StaffDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/staff/doctors")
      .then((r) => setDoctors(r.data))
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={centerStyle}>Loading…</div>;
  if (error) return <div style={{ ...centerStyle, color: "#dc2626" }}>{error}</div>;

  const STATUS_COLOR: Record<string, string> = { approved: "#16a34a", pending: "#d97706", rejected: "#dc2626" };
  const STATUS_BG: Record<string, string> = { approved: "#f0fdf4", pending: "#fffbeb", rejected: "#fef2f2" };

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 40px 64px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>Doctors</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>{doctors.length} doctors in your city</p>
      </div>

      {doctors.length === 0 ? (
        <div style={emptyStyle}>No doctors found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {doctors.map((d) => {
            const vs = d.verification_status;
            return (
              <div key={d.id} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#ffe5e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "15px", color: "#ff4d4d" }}>
                    {d.user?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "15px", color: "#111827" }}>{d.user?.name}</div>
                    <div style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Stethoscope size={12} /> {d.specialisation}</span>
                      {d.hospital && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Building2 size={12} /> {d.hospital?.name}</span>}
                    </div>
                  </div>
                </div>
                <span style={{ background: STATUS_BG[vs], color: STATUS_COLOR[vs], fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px" }}>
                  {vs?.charAt(0).toUpperCase() + vs?.slice(1)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

const centerStyle: React.CSSProperties = { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "14px" };
const emptyStyle: React.CSSProperties = { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "14px", background: "#ffffff", borderRadius: "16px", border: "1px solid #f3f4f6" };
const cardStyle: React.CSSProperties = { background: "#ffffff", borderRadius: "16px", padding: "18px 22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" };