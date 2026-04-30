import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateAvailability, getMe } from "../api";
import { getApiErrorMessage } from "../api/axios";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ availability: "green", available_from: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "doctor") { navigate("/"); return; }
  }, [user, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: "", text: "" });
    try {
      const payload = {
        availability: form.availability,
        available_from: form.availability === "yellow" ? form.available_from : null
      };
      await updateAvailability(payload);
      setMsg({ type: "success", text: "Availability updated successfully!" });
    } catch (err: any) {
      setMsg({ type: "error", text: getApiErrorMessage(err, "Update failed") });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ paddingTop: 28, maxWidth: 560 }}>
      <div className="page-header">
        <h1>Doctor Dashboard</h1>
        <p>Manage your availability status</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 4 }}>{user.name}</h3>
        <p style={{ color: "#718096", fontSize: "0.88rem", marginBottom: 20 }}>{user.email}</p>

        {msg.text && <div className={msg.type === "error" ? "msg-error" : "msg-success"}>{msg.text}</div>}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Availability Status</label>
            <select value={form.availability}
              onChange={e => setForm({ ...form, availability: e.target.value, available_from: "" })}>
              <option value="green">🟢 Available Now</option>
              <option value="yellow">🟡 Busy (set a time)</option>
              <option value="red">🔴 On Leave</option>
            </select>
          </div>

          {form.availability === "yellow" && (
            <div className="form-group">
              <label>Available From (e.g. "3:00 PM")</label>
              <input required value={form.available_from}
                onChange={e => setForm({ ...form, available_from: e.target.value })}
                placeholder="e.g. 3:00 PM" />
            </div>
          )}

          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Update Availability"}
          </button>
        </form>
      </div>

      <div className="card">
        <h4 style={{ marginBottom: 8 }}>Status Guide</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.88rem", color: "#4a5568" }}>
          <div>🟢 <strong>Available</strong> — patients see you as available right now</div>
          <div>🟡 <strong>Busy</strong> — show patients when you'll be free next</div>
          <div>🔴 <strong>On Leave</strong> — you'll be deprioritised in search results</div>
        </div>
      </div>
    </div>
  );
}