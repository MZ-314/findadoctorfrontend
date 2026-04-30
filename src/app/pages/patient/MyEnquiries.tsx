import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../api/axios";

interface Enquiry {
  id: number;
  message: string;
  reply?: string | null;
  status: string;
  created_at: string;
  doctor?: {
    user?: {
      name?: string;
    };
    specialisation?: string;
  };
}

export function MyEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/patient/enquiries");
        setEnquiries(res.data ?? []);
      } catch (err: any) {
        setError(getApiErrorMessage(err, "Could not load enquiries."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px 40px" }}>
      <h1 style={{ fontSize: "24px", margin: "0 0 6px", color: "#111827" }}>My Enquiries</h1>
      <p style={{ margin: "0 0 20px", color: "#6b7280" }}>Questions sent to doctors and their replies.</p>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px" }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#6b7280" }}>Loading enquiries...</p>
      ) : enquiries.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No enquiries yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#111827" }}>{enquiry.doctor?.user?.name ?? "Doctor"}</div>
                  <div style={{ color: "#6b7280", fontSize: "14px" }}>{enquiry.doctor?.specialisation ?? "Specialist"}</div>
                </div>
                <span style={{ fontSize: "12px", textTransform: "capitalize", background: "#f3f4f6", borderRadius: "999px", padding: "4px 10px", color: "#374151" }}>
                  {enquiry.status}
                </span>
              </div>
              <div style={{ marginTop: "8px", color: "#111827", fontSize: "14px" }}>
                <strong>Your message:</strong> {enquiry.message}
              </div>
              <div style={{ marginTop: "6px", color: "#6b7280", fontSize: "14px" }}>
                <strong>Reply:</strong> {enquiry.reply || "No reply yet"}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
