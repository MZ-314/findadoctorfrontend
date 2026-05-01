import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, Building2 } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

export function StaffHospitals() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState<Record<number, string>>({});
  const [acting, setActing] = useState<number | null>(null);

  const load = () => {
    api.get("/staff/hospitals")
      .then((r) => setHospitals(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleVerify = async (id: number, action: "approve" | "reject") => {
    if (action === "reject" && !rejectReason[id]?.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setActing(id);
    try {
      await api.put(`/staff/hospitals/${id}/verify`, {
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

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete ${name}? All associated doctors will be unlinked.`)) return;
    try {
      await api.delete(`/staff/hospitals/${id}`);
      load();
    } catch (e: any) {
      alert(getApiErrorMessage(e));
    }
  };

  if (loading) return <div style={centerStyle}>Loading…</div>;

  const STATUS_COLOR: Record<string, string> = { approved: "#16a34a", pending: "#d97706", rejected: "#dc2626" };
  const STATUS_BG: Record<string, string> = { approved: "#f0fdf4", pending: "#fffbeb", rejected: "#fef2f2" };

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 40px 64px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>Hospitals</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>{hospitals.length} hospitals in your city</p>
      </div>

      {hospitals.length === 0 ? (
        <div style={emptyStyle}>No hospitals found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {hospitals.map((h) => {
            const vs = h.verification_status;
            return (
              <div key={h.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Building2 size={20} color="#ff4d4d" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px", color: "#111827" }}>{h.name}</div>
                      <div style={{ fontSize: "13px", color: "#6b7280" }}>{h.address} · {h.budget_tier}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ background: STATUS_BG[vs], color: STATUS_COLOR[vs], fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px" }}>
                      {vs.charAt(0).toUpperCase() + vs.slice(1)}
                    </span>
                    <button onClick={() => handleDelete(h.id, h.name)}
                      style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "7px 10px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {vs === "pending" && (
                  <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                    <button onClick={() => handleVerify(h.id, "approve")} disabled={acting === h.id}
                      style={{ background: "#f0fdf4", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#16a34a", fontWeight: 600 }}>
                      <CheckCircle size={14} /> Approve
                    </button>
                    <input
                      value={rejectReason[h.id] ?? ""}
                      onChange={(e) => setRejectReason((prev) => ({ ...prev, [h.id]: e.target.value }))}
                      placeholder="Rejection reason…"
                      style={inputStyle}
                    />
                    <button onClick={() => handleVerify(h.id, "reject")} disabled={acting === h.id}
                      style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#dc2626", fontWeight: 600, whiteSpace: "nowrap" }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
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
const cardStyle: React.CSSProperties = { background: "#ffffff", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" };
const inputStyle: React.CSSProperties = { flex: 1, fontSize: "13px", color: "#111827", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "9px 12px", outline: "none", fontFamily: "'Inter', sans-serif" };