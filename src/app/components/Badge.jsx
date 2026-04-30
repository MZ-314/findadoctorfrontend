const badgeMap = {
  "Highly Rated": "⭐ Highly Rated",
  "Most Experienced": "🏅 Most Experienced",
  "Best Value": "💰 Best Value",
};

export default function Badge({ label }) {
  return <span className="badge badge-blue" style={{ marginRight: 5 }}>{badgeMap[label] || label}</span>;
}