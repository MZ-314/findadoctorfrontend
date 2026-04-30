import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDoctor, getReviews, submitReview } from "../api";
import { useAuth } from "../context/AuthContext";
import AvailabilityBadge from "../components/AvailabilityBadge";
import Badge from "../components/Badge";
import ReviewCard from "../components/ReviewCard";
import { getApiErrorMessage } from "../api/axios";

export default function DoctorProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getDoctor(id).then(r => setDoctor(r.data));
    getReviews(id).then(r => setReviews(r.data));
  };

  useEffect(() => { load(); }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true); setMsg({ type: "", text: "" });
    try {
      await submitReview(id, reviewForm);
      setMsg({ type: "success", text: "Review submitted!" });
      setReviewForm({ rating: 5, comment: "" });
      load();
    } catch (err: any) {
      setMsg({ type: "error", text: getApiErrorMessage(err, "Failed to submit review") });
    } finally {
      setSubmitting(false);
    }
  };

  if (!doctor) return <div className="container" style={{ paddingTop: 40 }}>Loading...</div>;

  const stars = "★".repeat(Math.round(doctor.avg_rating)) + "☆".repeat(5 - Math.round(doctor.avg_rating));

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      {/* Profile card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>{doctor.name}</h2>
            <p style={{ color: "#4a5568", marginTop: 3 }}>{doctor.specialisation} · {doctor.experience_years} years experience</p>
            <p style={{ color: "#718096", fontSize: "0.88rem", marginTop: 3 }}>{doctor.hospital.name}, {doctor.city_name}</p>
            <p style={{ color: "#718096", fontSize: "0.88rem" }}>{doctor.hospital.address}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <AvailabilityBadge availability={doctor.availability} availableFrom={doctor.available_from} />
            <p style={{ marginTop: 8, fontSize: "1.3rem", fontWeight: 700, color: "#2b6cb0" }}>₹{doctor.consultation_fee}</p>
            <p style={{ fontSize: "0.8rem", color: "#718096" }}>per consultation</p>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {doctor.badges && doctor.badges.map && doctor.badges?.map((b) => <Badge key={b} label={b} />)}
        </div>

        <hr style={{ margin: "16px 0", borderColor: "#e2e8f0" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <p style={{ fontSize: "0.8rem", color: "#a0aec0", fontWeight: 600, textTransform: "uppercase" }}>Education</p>
            <p style={{ fontSize: "0.9rem", marginTop: 3 }}>{doctor.education}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.8rem", color: "#a0aec0", fontWeight: 600, textTransform: "uppercase" }}>Languages</p>
            <p style={{ fontSize: "0.9rem", marginTop: 3 }}>{doctor.languages.join(", ")}</p>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <p style={{ fontSize: "0.8rem", color: "#a0aec0", fontWeight: 600, textTransform: "uppercase" }}>About</p>
            <p style={{ fontSize: "0.9rem", marginTop: 3, lineHeight: 1.6 }}>{doctor.bio}</p>
          </div>
        </div>

        <hr style={{ margin: "16px 0", borderColor: "#e2e8f0" }} />

        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div>
            <span className="stars" style={{ fontSize: "1.2rem" }}>{stars}</span>
            <span style={{ marginLeft: 8, fontWeight: 700 }}>{doctor.avg_rating > 0 ? doctor.avg_rating : "—"}</span>
            <span style={{ color: "#718096", fontSize: "0.85rem", marginLeft: 6 }}>({doctor.review_count} reviews)</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "#718096" }}>
            Hospital Quality Score: <strong>{doctor.hospital.quality_score}</strong>
          </div>
        </div>
      </div>

      {/* Review form — patients only */}
      {user && user.role === "patient" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14, fontWeight: 600 }}>Leave a Review</h3>
          {msg.text && <div className={msg.type === "error" ? "msg-error" : "msg-success"}>{msg.text}</div>}
          <form onSubmit={handleReview}>
            <div className="form-group">
              <label>Rating</label>
              <select value={reviewForm.rating}
                onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{"★".repeat(n)} ({n}/5)</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Comment (optional)</label>
              <textarea rows={3} value={reviewForm.comment}
                onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your experience..." />
            </div>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      <h3 style={{ marginBottom: 12, fontWeight: 600 }}>
        Patient Reviews {reviews.length > 0 && `(${reviews.length})`}
      </h3>
      {reviews.length === 0
        ? <p style={{ color: "#a0aec0" }}>No reviews yet. Be the first!</p>
        : reviews.map(r => <ReviewCard key={r.id} review={r} />)
      }
    </div>
  );
}