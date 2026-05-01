import { useState, useEffect } from "react";
import { Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: "#fffbeb", text: "#d97706", label: "Pending" },
  accepted:  { bg: "#f0fdf4", text: "#16a34a", label: "Accepted" },
  rejected:  { bg: "#fef2f2", text: "#dc2626", label: "Rejected" },
  cancelled: { bg: "#f9fafb", text: "#6b7280", label: "Cancelled" },
};

export function DoctorAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/doctor/appointments")
      .then((r) => setAppointments(r.data))
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (id: number, status: string, note?: string) => {
    try {
      await api.put(`/doctor/appointments/${id}`, { status, doctor_note: note });
      load();
    } catch (e: any) {
      alert(getApiErrorMessage(e));
    }
  };

  if (loading) return <div style={centerStyle}>Loading appointments…</div>;
  if (error) return <div style={{ ...centerStyle, color: "#dc2626" }}>{error}</div>;

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 40px 64px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>Appointments</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>{appointments.length} total</p>
      </div>

      {appointments.length === 0 ? (
        <div style={emptyStyle}>No appointments yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {appointments.map((a) => {
            const s = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.pending;
            return (
              <div key={a.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <User size={14} color="#9ca3af" />
                      <span style={{ fontWeight: 600, fontSize: "15px", color: "#111827" }}>
                        {a.patient?.name ?? `Patient #${a.patient_id}`}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#6b7280" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Calendar size={13} /> {a.requested_date}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Clock size={13} /> {a.requested_time}
                      </span>
                    </div>
                    {a.reason && <div style={{ fontSize: "13px", color: "#6b7280" }}>Reason: {a.reason}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ background: s.bg, color: s.text, fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px" }}>
                      {s.label}
                    </span>
                    {a.status === "pending" && (
                      <>
                        <button onClick={() => handleUpdate(a.id, "accepted")}
                          style={{ background: "#f0fdf4", border: "none", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#16a34a", fontWeight: 600 }}>
                          <CheckCircle size={14} /> Accept
                        </button>
                        <button onClick={() => handleUpdate(a.id, "rejected")}
                          style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {a.doctor_note && (
                  <div style={{ marginTop: "10px", padding: "10px 12px", background: "#f9fafb", borderRadius: "8px", fontSize: "13px", color: "#6b7280" }}>
                    Note: {a.doctor_note}
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