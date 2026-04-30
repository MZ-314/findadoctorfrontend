import { LoginCard } from "../components/LoginCard";

export function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <LoginCard />
    </div>
  );
}