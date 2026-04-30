export default function ReviewCard({ review }) {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const date = new Date(review.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong style={{ fontSize: "0.9rem" }}>{review.reviewer_name}</strong>
        <span style={{ color: "#a0aec0", fontSize: "0.8rem" }}>{date}</span>
      </div>
      <div className="stars" style={{ margin: "4px 0" }}>{stars}</div>
      {review.comment && <p style={{ color: "#4a5568", fontSize: "0.88rem" }}>{review.comment}</p>}
    </div>
  );
}