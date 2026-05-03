import { useEffect, useState } from "react";
import { Calendar, Clock, Stethoscope } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: "#fffbeb", text: "#d97706", label: "Pending" },
  accepted:  { bg: "#f0fdf4", text: "#16a34a", label: "Accepted" },
  rejected:  { bg: "#fef2f2", text: "#dc2626", label: "Rejected" },
  cancelled: { bg: "#f9fafb", text: "#6b7280", label: "Cancelled" },
};

interface Appointment {
  id: number;
  requested_date: string;
  requested_time: string;
  status: string;
  reason?: string | null;
  doctor_note?: string | null;
  doctor?: { user?: { name?: string }; specialisation?: string };
}

export function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/patient/appointments");
      setAppointments(res.data ?? []);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Could not load appointments."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: number) => {
    try {
      await api.delete(`/patient/appointments/${id}`);
      await load();
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Could not cancel appointment."));
    }
  };

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 40px 64px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>My Appointments</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>Track your appointment requests and statuses</p>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", fontWeight: 500 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={centerStyle}>Loading appointments…</div>
      ) : appointments.length === 0 ? (
        <div style={emptyStyle}>No appointments yet. Book one from a doctor's profile.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {appointments.map((appt) => {
            const s = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
            return (
              <div key={appt.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>
                      {appt.doctor?.user?.name ?? "Doctor"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "5px" }}>
                      <Stethoscope size={12} /> {appt.doctor?.specialisation ?? "Specialist"}
                    </div>
                    <div style={{ display: "flex", gap: "14px", fontSize: "13px", color: "#6b7280" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Calendar size={13} /> {appt.requested_date}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Clock size={13} /> {appt.requested_time}
                      </span>
                    </div>
                    {appt.reason && (
                      <div style={{ fontSize: "13px", color: "#6b7280" }}>Reason: {appt.reason}</div>
                    )}
                  </div>
                  <span style={{ background: s.bg, color: s.text, fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px" }}>
                    {s.label}
                  </span>
                </div>
                {appt.doctor_note && (
                  <div style={{ marginTop: "10px", padding: "10px 12px", background: "#f0fdf4", borderRadius: "8px", fontSize: "13px", color: "#16a34a", borderLeft: "3px solid #86efac" }}>
                    <strong>Doctor's note:</strong> {appt.doctor_note}
                  </div>
                )}
                {appt.status === "pending" && (
                  <button onClick={() => handleCancel(appt.id)}
                    style={{ marginTop: "12px", background: "#fef2f2", border: "none", borderRadius: "8px", padding: "8px 14px", color: "#dc2626", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                    Cancel Request
                  </button>
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