import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Stethoscope } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

export function PendingDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState<Record<number, string>>({});
  const [acting, setActing] = useState<number | null>(null);

  const load = () => {
    api.get("/hospital/pending-doctors")
      .then((r) => setDoctors(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    if (action === "reject" && !rejectReason[id]?.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setActing(id);
    try {
      await api.put(`/hospital/doctors/${id}/verify`, {
        action,
        rejection_reason: action === "reject" ? rejectReason[id] : undefined,
      });
      load();
    } catch (e: any) {
      alert(getApiErrorMessage(e));
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div style={centerStyle}>Loading…</div>;

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 40px 64px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>Pending Approvals</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>{doctors.length} doctor{doctors.length !== 1 ? "s" : ""} awaiting verification</p>
      </div>

      {doctors.length === 0 ? (
        <div style={emptyStyle}>No pending doctors. You're all caught up!</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {doctors.map((d) => (
            <div key={d.id} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#ffe5e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "15px", color: "#ff4d4d" }}>
                    {d.user?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "15px", color: "#111827" }}>{d.user?.name}</div>
                    <div style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "5px" }}>
                      <Stethoscope size={12} /> {d.specialisation} · {d.experience_years} yrs exp
                    </div>
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{d.user?.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleAction(d.id, "approve")} disabled={acting === d.id}
                    style={{ background: "#f0fdf4", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#16a34a", fontWeight: 600 }}>
                    <CheckCircle size={14} /> Approve
                  </button>
                </div>
              </div>
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                <input
                  value={rejectReason[d.id] ?? ""}
                  onChange={(e) => setRejectReason((prev) => ({ ...prev, [d.id]: e.target.value }))}
                  placeholder="Rejection reason (required to reject)…"
                  style={inputStyle}
                />
                <button onClick={() => handleAction(d.id, "reject")} disabled={acting === d.id}
                  style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#dc2626", fontWeight: 600, whiteSpace: "nowrap" }}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const centerStyle: React.CSSProperties = { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "14px" };
const emptyStyle: React.CSSProperties = { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "14px", background: "#ffffff", borderRadius: "16px", border: "1px solid #f3f4f6" };
const cardStyle: React.CSSProperties = { background: "#ffffff", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" };
const inputStyle: React.CSSProperties = { flex: 1, fontSize: "13px", color: "#111827", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "9px 12px", outline: "none", fontFamily: "'Inter', sans-serif" };