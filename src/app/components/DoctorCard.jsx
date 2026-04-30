import { useNavigate } from "react-router-dom";
import AvailabilityBadge from "./AvailabilityBadge";
import Badge from "./Badge";

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();
  const stars = "★".repeat(Math.round(doctor.avg_rating)) + "☆".repeat(5 - Math.round(doctor.avg_rating));

  return (
    <div className="card" style={{ marginBottom: 14, cursor: "pointer" }}
      onClick={() => navigate(`/doctors/${doctor.id}`)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{doctor.name}</h3>
          <p style={{ color: "#4a5568", fontSize: "0.88rem", marginTop: 2 }}>
            {doctor.specialisation} · {doctor.experience_years} yrs exp
          </p>
          <p style={{ color: "#718096", fontSize: "0.83rem", marginTop: 3 }}>
            {doctor.hospital_name}, {doctor.city_name}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <AvailabilityBadge availability={doctor.availability} availableFrom={doctor.available_from} />
          <p style={{ marginTop: 6, fontWeight: 700, color: "#2b6cb0" }}>₹{doctor.consultation_fee}</p>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        {doctor.badges.map((b) => <Badge key={b} label={b} />)}
      </div>

      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="stars">{stars}
          <span style={{ color: "#718096", fontSize: "0.8rem", marginLeft: 5 }}>
            {doctor.avg_rating > 0 ? `${doctor.avg_rating} (${doctor.review_count})` : "No reviews yet"}
          </span>
        </span>
        <span style={{ fontSize: "0.8rem", color: "#718096" }}>
          {doctor.languages.join(", ")}
        </span>
      </div>
    </div>
  );
}