import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function DoctorSchedule() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ day_of_week: "monday", start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 });
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = () => {
    api.get("/doctor/me")
      .then((r) => setSchedule(r.data.schedule ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setMsg({ type: "", text: "" });
    try {
      await api.post("/doctor/schedule", form);
      setMsg({ type: "success", text: "Slot added!" });
      load();
    } catch (err: any) {
      setMsg({ type: "error", text: getApiErrorMessage(err) });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/doctor/schedule/${id}`);
      load();
    } catch (e: any) {
      alert(getApiErrorMessage(e));
    }
  };

  if (loading) return <div style={centerStyle}>Loading schedule…</div>;

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "36px 40px 64px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>Schedule</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>Manage your weekly availability slots</p>
      </div>

      {/* Add slot form */}
      <div style={cardStyle}>
        <h3 style={{ fontWeight: 700, fontSize: "15px", color: "#111827", margin: "0 0 16px" }}>Add Slot</h3>
        {msg.text && (
          <div style={{ background: msg.type === "error" ? "#fef2f2" : "#f0fdf4", border: `1.5px solid ${msg.type === "error" ? "#fecaca" : "#bbf7d0"}`, borderRadius: "8px", padding: "9px 12px", marginBottom: "14px", fontSize: "13px", color: msg.type === "error" ? "#dc2626" : "#16a34a", fontWeight: 500 }}>
            {msg.text}
          </div>
        )}
        <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Day</label>
            <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })} style={selectStyle}>
              {DAYS.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Start</label>
            <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>End</label>
            <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Slot (mins)</label>
            <input type="number" min={15} max={60} value={form.slot_duration_minutes} onChange={(e) => setForm({ ...form, slot_duration_minutes: parseInt(e.target.value) })} style={inputStyle} />
          </div>
          <button type="submit" disabled={adding} style={{ ...btnStyle, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
            <Plus size={15} /> {adding ? "Adding…" : "Add"}
          </button>
        </form>
      </div>

      {/* Schedule list */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {schedule.length === 0 ? (
          <div style={emptyStyle}>No schedule slots yet. Add one above.</div>
        ) : (
          schedule.map((s) => (
            <div key={s.id} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: "#374151" }}>
                <span style={{ fontWeight: 600, color: "#111827", minWidth: "90px", textTransform: "capitalize" }}>{s.day_of_week}</span>
                <span>{s.start_time} – {s.end_time}</span>
                <span style={{ color: "#9ca3af" }}>{s.slot_duration_minutes} min slots</span>
              </div>
              <button onClick={() => handleDelete(s.id)} style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "7px 10px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center" }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

const centerStyle: React.CSSProperties = { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "14px" };
const emptyStyle: React.CSSProperties = { textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px", background: "#ffffff", borderRadius: "16px", border: "1px solid #f3f4f6" };
const cardStyle: React.CSSProperties = { background: "#ffffff", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" };
const labelStyle: React.CSSProperties = { fontSize: "12px", fontWeight: 500, color: "#6b7280" };
const inputStyle: React.CSSProperties = { fontSize: "14px", color: "#111827", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "9px 12px", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer", appearance: "none" };
const btnStyle: React.CSSProperties = { background: "#ff4d4d", color: "#ffffff", border: "none", borderRadius: "10px", padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px", cursor: "pointer" };