import { useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";
import api, { getApiErrorMessage } from "../../api/axios";

interface Enquiry {
  id: number;
  message: string;
  reply?: string | null;
  status: string;
  created_at: string;
  doctor?: { user?: { name?: string }; specialisation?: string };
}

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  open:     { bg: "#fffbeb", text: "#d97706" },
  answered: { bg: "#f0fdf4", text: "#16a34a" },
  closed:   { bg: "#f9fafb", text: "#6b7280" },
};

export function MyEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/patient/enquiries")
      .then((r) => setEnquiries(r.data ?? []))
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 40px 64px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "26px", color: "#111827", margin: "0 0 4px" }}>My Enquiries</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>Questions sent to doctors and their replies</p>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", fontWeight: 500 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={centerStyle}>Loading enquiries…</div>
      ) : enquiries.length === 0 ? (
        <div style={emptyStyle}>No enquiries yet. Send one from a doctor's profile.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {enquiries.map((e) => {
            const s = STATUS_CONFIG[e.status] ?? STATUS_CONFIG.open;
            return (
              <div key={e.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>
                      {e.doctor?.user?.name ?? "Doctor"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                      <Stethoscope size={12} /> {e.doctor?.specialisation ?? "Specialist"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                    <span style={{ background: s.bg, color: s.text, fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", textTransform: "capitalize" }}>
                      {e.status}
                    </span>
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <div style={{ padding: "10px 12px", background: "#f9fafb", borderRadius: "8px", fontSize: "14px", color: "#374151", lineHeight: 1.5, marginBottom: "10px" }}>
                  {e.message}
                </div>
                {e.reply ? (
                  <div style={{ padding: "10px 12px", background: "#f0fdf4", borderRadius: "8px", fontSize: "14px", color: "#16a34a", lineHeight: 1.5, borderLeft: "3px solid #86efac" }}>
                    <strong style={{ display: "block", marginBottom: "3px", fontSize: "12px" }}>Doctor's Reply</strong>
                    {e.reply}
                  </div>
                ) : (
                  <div style={{ fontSize: "13px", color: "#9ca3af", fontStyle: "italic" }}>
                    Awaiting reply…
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