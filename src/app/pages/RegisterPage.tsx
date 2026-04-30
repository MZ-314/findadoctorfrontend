import { RegisterCard } from "../components/RegisterCard";

export function RegisterPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <RegisterCard />
    </div>
  );
}