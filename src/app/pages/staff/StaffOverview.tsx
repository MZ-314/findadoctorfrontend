import { useState, useEffect } from "react";
import { Building2, Stethoscope, Clock, CheckCircle } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

export function StaffOverview() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/staff/overview")
      .then((r) => setOverview(r.data))
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={centerStyle}>Loading…</div>;
  if (error) return <div style={{ ...centerStyle, color: "#dc2626" }}>{error}</div>;

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 40px 64px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>
          Staff Overview — {overview?.city}
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>City-wide statistics</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard icon={<Building2 size={20} color="#ff4d4d" />} label="Total Hospitals" value={overview?.total_hospitals} />
        <StatCard icon={<Clock size={20} color="#f59e0b" />} label="Pending Hospitals" value={overview?.pending_hospitals} accent="#f59e0b" />
        <StatCard icon={<CheckCircle size={20} color="#22c55e" />} label="Approved Hospitals" value={overview?.approved_hospitals} accent="#22c55e" />
        <StatCard icon={<Stethoscope size={20} color="#ff4d4d" />} label="Total Doctors" value={overview?.total_doctors} />
        <StatCard icon={<Clock size={20} color="#f59e0b" />} label="Pending Doctors" value={overview?.pending_doctors} accent="#f59e0b" />
        <StatCard icon={<CheckCircle size={20} color="#22c55e" />} label="Approved Doctors" value={overview?.approved_doctors} accent="#22c55e" />
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, accent = "#ff4d4d" }: { icon: React.ReactNode; label: string; value: number; accent?: string }) {
  return (
    <div style={{ background: "#ffffff", borderRadius: "16px", padding: "22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: accent }}>{value ?? 0}</div>
      <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

const centerStyle: React.CSSProperties = { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "14px" };