import { useState, useEffect } from "react";
import { MessageCircle, User } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

export function DoctorEnquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [sending, setSending] = useState<number | null>(null);

  const load = () => {
    api.get("/doctor/enquiries")
      .then((r) => setEnquiries(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleReply = async (id: number) => {
    if (!replyText[id]?.trim()) return;
    setSending(id);
    try {
      await api.put(`/doctor/enquiries/${id}/reply`, { reply: replyText[id] });
      setReplyText((prev) => ({ ...prev, [id]: "" }));
      load();
    } catch (e: any) {
      alert(getApiErrorMessage(e));
    } finally {
      setSending(null);
    }
  };

  if (loading) return <div style={centerStyle}>Loading enquiries…</div>;

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 40px 64px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>Enquiries</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>{enquiries.length} total</p>
      </div>

      {enquiries.length === 0 ? (
        <div style={emptyStyle}>No enquiries yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {enquiries.map((e) => (
            <div key={e.id} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <User size={14} color="#9ca3af" />
                <span style={{ fontWeight: 600, fontSize: "14px", color: "#111827" }}>
                  {e.patient?.name ?? `Patient #${e.patient_id}`}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "11px", color: "#9ca3af" }}>
                  {new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, marginBottom: "12px", padding: "10px 12px", background: "#f9fafb", borderRadius: "8px" }}>
                {e.message}
              </div>
              {e.reply ? (
                <div style={{ fontSize: "13px", color: "#16a34a", padding: "10px 12px", background: "#f0fdf4", borderRadius: "8px", borderLeft: "3px solid #86efac" }}>
                  <strong>Your reply:</strong> {e.reply}
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    value={replyText[e.id] ?? ""}
                    onChange={(ev) => setReplyText((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                    placeholder="Write a reply…"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => handleReply(e.id)}
                    disabled={sending === e.id}
                    style={btnStyle}
                  >
                    {sending === e.id ? "Sending…" : "Reply"}
                  </button>
                </div>
              )}
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
const inputStyle: React.CSSProperties = { flex: 1, fontSize: "14px", color: "#111827", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", outline: "none", fontFamily: "'Inter', sans-serif" };
const btnStyle: React.CSSProperties = { background: "#ff4d4d", color: "#ffffff", border: "none", borderRadius: "10px", padding: "10px 18px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap" };