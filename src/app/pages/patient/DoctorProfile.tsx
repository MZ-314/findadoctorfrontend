import { useEffect, useState } from "react";
import { useParams } from "react-router";
import api, { getApiErrorMessage } from "../../api/axios";

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
  hospital?: { name?: string; address?: string };
  city_name?: string;
  availability?: string;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  reviewer_name: string;
  created_at: string;
}

export function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<DoctorProfileData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const [doctorRes, reviewsRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get(`/doctors/${id}/reviews`),
        ]);
        setDoctor(doctorRes.data);
        setReviews(reviewsRes.data ?? []);
      } catch (err: any) {
        setError(getApiErrorMessage(err, "Could not load doctor profile."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px 40px" }}>Loading profile...</main>;
  }

  if (error) {
    return (
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px 40px" }}>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "8px", padding: "10px 12px" }}>
          {error}
        </div>
      </main>
    );
  }

  if (!doctor) {
    return <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px 40px" }}>Doctor not found.</main>;
  }

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px 40px" }}>
      <h1 style={{ fontSize: "26px", margin: 0, color: "#111827" }}>{doctor.name}</h1>
      <p style={{ color: "#6b7280", margin: "6px 0 18px" }}>
        {doctor.specialisation} | {doctor.experience_years} years experience
      </p>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
        <div>Hospital: {doctor.hospital?.name ?? "N/A"}</div>
        <div>City: {doctor.city_name ?? "N/A"}</div>
        <div>Fee: INR {doctor.consultation_fee}</div>
        <div>Rating: {doctor.avg_rating} ({doctor.review_count} reviews)</div>
        {doctor.languages && doctor.languages.length > 0 && <div>Languages: {doctor.languages.join(", ")}</div>}
        {doctor.education && <div>Education: {doctor.education}</div>}
        {doctor.bio && <div style={{ marginTop: "6px" }}>About: {doctor.bio}</div>}
      </div>

      <h2 style={{ fontSize: "20px", margin: "14px 0 10px", color: "#111827" }}>Reviews</h2>
      {reviews.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No reviews yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px" }}>
              <div style={{ fontWeight: 600, color: "#111827" }}>{review.reviewer_name}</div>
              <div style={{ color: "#6b7280", fontSize: "14px" }}>Rating: {review.rating}/5</div>
              {review.comment && <div style={{ marginTop: "6px", color: "#374151" }}>{review.comment}</div>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
