import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../api/axios";

interface Appointment {
  id: number;
  requested_date: string;
  requested_time: string;
  status: string;
  reason?: string | null;
  doctor?: {
    user?: {
      name?: string;
    };
    specialisation?: string;
  };
}

export function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = async () => {
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

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (id: number) => {
    try {
      await api.delete(`/patient/appointments/${id}`);
      await loadAppointments();
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Could not cancel appointment."));
    }
  };

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px 40px" }}>
      <h1 style={{ fontSize: "24px", margin: "0 0 6px", color: "#111827" }}>My Appointments</h1>
      <p style={{ margin: "0 0 20px", color: "#6b7280" }}>Track your appointment requests and statuses.</p>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px" }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#6b7280" }}>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No appointments yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {appointments.map((appt) => (
            <div key={appt.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#111827" }}>{appt.doctor?.user?.name ?? "Doctor"}</div>
                  <div style={{ color: "#6b7280", fontSize: "14px" }}>{appt.doctor?.specialisation ?? "Specialist"}</div>
                </div>
                <span style={{ fontSize: "12px", textTransform: "capitalize", background: "#f3f4f6", borderRadius: "999px", padding: "4px 10px", color: "#374151" }}>
                  {appt.status}
                </span>
              </div>
              <div style={{ marginTop: "8px", color: "#374151", fontSize: "14px" }}>
                {appt.requested_date} at {appt.requested_time}
              </div>
              {appt.reason && <div style={{ marginTop: "6px", color: "#6b7280", fontSize: "14px" }}>Reason: {appt.reason}</div>}
              {appt.status !== "accepted" && appt.status !== "cancelled" && (
                <button
                  onClick={() => handleCancel(appt.id)}
                  style={{ marginTop: "10px", border: "none", borderRadius: "8px", padding: "8px 12px", background: "#ef4444", color: "#fff", cursor: "pointer" }}
                >
                  Cancel Request
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
