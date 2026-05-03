import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  MapPin, Briefcase, Star, Clock, Calendar,
  MessageCircle, ChevronLeft, Building2
} from "lucide-react";
import { useNavigate } from "react-router";
import api, { getApiErrorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

interface ScheduleSlot {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
}

interface DoctorProfileData {
  id: number;
  name: string;
  specialisation: string;
  experience_years: number;
  education?: string;
  bio?: string;
  languages?: string[];
  consultation_fee: number;
  avg_rating: number;
  review_count: number;
  availability: string;
  available_from?: string;
  hospital?: { id: number; name?: string; address?: string; budget_tier?: string };
  city_name?: string;
  schedule?: ScheduleSlot[];
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  reviewer_name: string;
  created_at: string;
}

const DAYS_ORDER = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let current = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (current + duration <= endMin) {
    const h = Math.floor(current / 60).toString().padStart(2, "0");
    const m = (current % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    current += duration;
  }
  return slots;
}

const AVAIL_CONFIG: Record<string, { dot: string; label: string; bg: string; text: string }> = {
  green:  { dot: "#22c55e", label: "Available Now",  bg: "#f0fdf4", text: "#16a34a" },
  yellow: { dot: "#f59e0b", label: "Available Soon", bg: "#fffbeb", text: "#d97706" },
  red:    { dot: "#ef4444", label: "Not Available",  bg: "#fef2f2", text: "#dc2626" },
};

export function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState<DoctorProfileData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Appointment state
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [apptReason, setApptReason] = useState("");
  const [bookingMsg, setBookingMsg] = useState({ type: "", text: "" });
  const [booking, setBooking] = useState(false);

  // Enquiry state
  const [enquiryMsg, setEnquiryMsg] = useState("");
  const [enquiryStatus, setEnquiryStatus] = useState({ type: "", text: "" });
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState({ type: "", text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/doctors/${id}`),
      api.get(`/doctors/${id}/reviews`),
    ]).then(([dr, rv]) => {
      setDoctor(dr.data);
      setReviews(rv.data ?? []);
    }).catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const scheduleByDay = (doctor?.schedule ?? []).reduce<Record<string, ScheduleSlot[]>>((acc, s) => {
    if (!acc[s.day_of_week]) acc[s.day_of_week] = [];
    acc[s.day_of_week].push(s);
    return acc;
  }, {});

  const availableDays = DAYS_ORDER.filter((d) => scheduleByDay[d]?.length > 0);

  const timeSlotsForDay = selectedDay
    ? scheduleByDay[selectedDay]?.flatMap((s) =>
        generateSlots(s.start_time, s.end_time, s.slot_duration_minutes)
      ) ?? []
    : [];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    setBooking(true);
    setBookingMsg({ type: "", text: "" });
    try {
      await api.post("/patient/appointments", {
        doctor_id: Number(id),
        requested_date: selectedDate,
        requested_time: selectedTime,
        reason: apptReason || undefined,
      });
      setBookingMsg({ type: "success", text: "Appointment request sent successfully!" });
      setSelectedDay(""); setSelectedDate(""); setSelectedTime(""); setApptReason("");
    } catch (err: any) {
      setBookingMsg({ type: "error", text: getApiErrorMessage(err) });
    } finally {
      setBooking(false);
    }
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryMsg.trim()) return;
    setSendingEnquiry(true);
    setEnquiryStatus({ type: "", text: "" });
    try {
      await api.post("/patient/enquiries", { doctor_id: Number(id), message: enquiryMsg });
      setEnquiryStatus({ type: "success", text: "Enquiry sent! The doctor will reply shortly." });
      setEnquiryMsg("");
    } catch (err: any) {
      setEnquiryStatus({ type: "error", text: getApiErrorMessage(err) });
    } finally {
      setSendingEnquiry(false);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewStatus({ type: "", text: "" });
    try {
      await api.post(`/doctors/${id}/reviews`, { rating: reviewRating, comment: reviewComment || undefined });
      setReviewStatus({ type: "success", text: "Review submitted!" });
      setReviewComment("");
      const rv = await api.get(`/doctors/${id}/reviews`);
      setReviews(rv.data ?? []);
    } catch (err: any) {
      setReviewStatus({ type: "error", text: getApiErrorMessage(err) });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div style={centerStyle}>Loading profile…</div>;
  if (error) return <div style={{ ...centerStyle, color: "#dc2626" }}>{error}</div>;
  if (!doctor) return <div style={centerStyle}>Doctor not found.</div>;

  const avail = AVAIL_CONFIG[doctor.availability] ?? AVAIL_CONFIG.green;

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 40px 64px", fontFamily: "'Inter', sans-serif" }}>

      {/* Back */}
      <button onClick={() => navigate("/patient")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af", fontSize: "14px", fontFamily: "'Inter', sans-serif", marginBottom: "20px", padding: 0 }}>
        <ChevronLeft size={16} /> Back to search
      </button>

      {/* Header card */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#ffe5e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "22px", color: "#ff4d4d", flexShrink: 0 }}>
              {doctor.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: "22px", color: "#111827", margin: "0 0 4px" }}>{doctor.name}</h1>
              <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                {doctor.specialisation} · {doctor.experience_years} years experience
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: avail.bg, borderRadius: "20px", padding: "4px 10px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: avail.dot }} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: avail.text }}>{avail.label}</span>
                {doctor.available_from && <span style={{ fontSize: "12px", color: avail.text }}>from {doctor.available_from}</span>}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#ff4d4d" }}>₹{doctor.consultation_fee}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af" }}>per consultation</div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", justifyContent: "flex-end", marginTop: "6px" }}>
              <Star size={14} fill="#ff4d4d" stroke="none" />
              <span style={{ fontWeight: 700, color: "#111827", fontSize: "14px" }}>{doctor.avg_rating?.toFixed(1)}</span>
              <span style={{ color: "#9ca3af", fontSize: "13px" }}>({doctor.review_count} reviews)</span>
            </div>
          </div>
        </div>

        <hr style={{ margin: "18px 0", borderColor: "#f3f4f6", borderStyle: "solid" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {doctor.hospital?.name && (
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: "#6b7280" }}>
              <Building2 size={14} color="#9ca3af" /> {doctor.hospital.name}
            </div>
          )}
          {doctor.city_name && (
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: "#6b7280" }}>
              <MapPin size={14} color="#9ca3af" /> {doctor.city_name}
            </div>
          )}
          {doctor.education && (
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: "#6b7280" }}>
              <Briefcase size={14} color="#9ca3af" /> {doctor.education}
            </div>
          )}
          {doctor.languages && doctor.languages.length > 0 && (
            <div style={{ fontSize: "13px", color: "#6b7280" }}>
              🗣 {doctor.languages.join(", ")}
            </div>
          )}
        </div>

        {doctor.bio && (
          <div style={{ marginTop: "14px", padding: "12px 14px", background: "#f9fafb", borderRadius: "10px", fontSize: "14px", color: "#374151", lineHeight: 1.6 }}>
            {doctor.bio}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>

        {/* Book Appointment */}
        {user?.role === "patient" && (
          <div style={cardStyle}>
            <h2 style={{ fontWeight: 700, fontSize: "16px", color: "#111827", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={16} color="#ff4d4d" /> Book Appointment
            </h2>
            {availableDays.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#9ca3af" }}>This doctor hasn't set a schedule yet.</p>
            ) : (
              <form onSubmit={handleBook} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {bookingMsg.text && <StatusMsg type={bookingMsg.type} text={bookingMsg.text} />}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={labelStyle}>Select Day</label>
                  <select value={selectedDay} onChange={(e) => { setSelectedDay(e.target.value); setSelectedTime(""); }} style={selectStyle} required>
                    <option value="">Choose a day</option>
                    {availableDays.map((d) => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {selectedDay && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={labelStyle}>Select Date</label>
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={inputStyle} required min={new Date().toISOString().split("T")[0]} />
                  </div>
                )}
                {selectedDay && timeSlotsForDay.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={labelStyle}>Select Time</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                      {timeSlotsForDay.map((t) => (
                        <button key={t} type="button" onClick={() => setSelectedTime(t)}
                          style={{ padding: "6px 12px", borderRadius: "8px", border: `1.5px solid ${selectedTime === t ? "#ff4d4d" : "#e5e7eb"}`, background: selectedTime === t ? "#ffe5e5" : "#f9fafb", color: selectedTime === t ? "#ff4d4d" : "#374151", fontSize: "13px", fontWeight: selectedTime === t ? 600 : 400, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={labelStyle}>Reason (optional)</label>
                  <textarea value={apptReason} onChange={(e) => setApptReason(e.target.value)} rows={2} placeholder="Brief description of your concern…" style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <button type="submit" disabled={booking || !selectedTime} style={{ ...btnStyle, opacity: !selectedTime ? 0.5 : 1 }}>
                  {booking ? "Sending…" : "Request Appointment"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Send Enquiry */}
        {user?.role === "patient" && (
          <div style={cardStyle}>
            <h2 style={{ fontWeight: 700, fontSize: "16px", color: "#111827", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageCircle size={16} color="#ff4d4d" /> Send Enquiry
            </h2>
            <form onSubmit={handleEnquiry} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {enquiryStatus.text && <StatusMsg type={enquiryStatus.type} text={enquiryStatus.text} />}
              <textarea value={enquiryMsg} onChange={(e) => setEnquiryMsg(e.target.value)} rows={5} placeholder="Ask the doctor a question about your condition, treatment options, or anything else…" style={{ ...inputStyle, resize: "vertical" }} required />
              <button type="submit" disabled={sendingEnquiry || !enquiryMsg.trim()} style={{ ...btnStyle, opacity: !enquiryMsg.trim() ? 0.5 : 1 }}>
                {sendingEnquiry ? "Sending…" : "Send Enquiry"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Schedule */}
      {availableDays.length > 0 && (
        <div style={{ ...cardStyle, marginTop: "20px" }}>
          <h2 style={{ fontWeight: 700, fontSize: "16px", color: "#111827", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={16} color="#ff4d4d" /> Weekly Schedule
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
            {availableDays.map((day) => (
              <div key={day} style={{ background: "#f9fafb", borderRadius: "10px", padding: "12px" }}>
                <div style={{ fontWeight: 600, fontSize: "13px", color: "#111827", textTransform: "capitalize", marginBottom: "6px" }}>{day}</div>
                {scheduleByDay[day].map((s) => (
                  <div key={s.id} style={{ fontSize: "12px", color: "#6b7280" }}>
                    {s.start_time} – {s.end_time}
                    <span style={{ color: "#9ca3af", marginLeft: "4px" }}>({s.slot_duration_minutes}m)</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div style={{ ...cardStyle, marginTop: "20px" }}>
        <h2 style={{ fontWeight: 700, fontSize: "16px", color: "#111827", margin: "0 0 16px" }}>
          Patient Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>

        {/* Submit review */}
        {user?.role === "patient" && (
          <div style={{ marginBottom: "20px", padding: "16px", background: "#f9fafb", borderRadius: "12px" }}>
            <h3 style={{ fontWeight: 600, fontSize: "14px", color: "#111827", margin: "0 0 12px" }}>Leave a Review</h3>
            <form onSubmit={handleReview} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reviewStatus.text && <StatusMsg type={reviewStatus.type} text={reviewStatus.text} />}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={labelStyle}>Rating</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewRating(n)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", padding: "2px", color: n <= reviewRating ? "#ff4d4d" : "#e5e7eb" }}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={2} placeholder="Share your experience (optional)…" style={{ ...inputStyle, resize: "vertical" }} />
              <button type="submit" disabled={submittingReview} style={{ ...btnStyle, alignSelf: "flex-start", padding: "9px 18px" }}>
                {submittingReview ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          </div>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>No reviews yet. Be the first!</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ padding: "14px", background: "#f9fafb", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 600, fontSize: "14px", color: "#111827" }}>{r.reviewer_name}</span>
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div style={{ color: "#ff4d4d", fontSize: "16px", marginBottom: "4px" }}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
                {r.comment && <p style={{ fontSize: "14px", color: "#374151", margin: 0, lineHeight: 1.5 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatusMsg({ type, text }: { type: string; text: string }) {
  return (
    <div style={{ background: type === "error" ? "#fef2f2" : "#f0fdf4", border: `1.5px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`, borderRadius: "8px", padding: "9px 12px", fontSize: "13px", color: type === "error" ? "#dc2626" : "#16a34a", fontWeight: 500 }}>
      {text}
    </div>
  );
}

const centerStyle: React.CSSProperties = { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "14px", fontFamily: "'Inter', sans-serif" };
const cardStyle: React.CSSProperties = { background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" };
const labelStyle: React.CSSProperties = { fontSize: "12px", fontWeight: 500, color: "#6b7280" };
const inputStyle: React.CSSProperties = { fontSize: "14px", color: "#111827", background: "#ffffff", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer", appearance: "none" };
const btnStyle: React.CSSProperties = { background: "#ff4d4d", color: "#ffffff", border: "none", borderRadius: "10px", padding: "11px 0", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px", cursor: "pointer", width: "100%", boxShadow: "0 2px 10px rgba(255,77,77,0.2)" };