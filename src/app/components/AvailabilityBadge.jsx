export default function AvailabilityBadge({ availability, availableFrom }) {
  const map = {
    green: { cls: "badge-green", label: "Available Now" },
    yellow: { cls: "badge-yellow", label: availableFrom ? `Free from ${availableFrom}` : "Busy" },
    red: { cls: "badge-red", label: "On Leave" },
  };
  const { cls, label } = map[availability] || map.red;
  return <span className={`badge ${cls}`}>{label}</span>;
}