import { useState, useEffect } from "react";
import { getCities, getSpecialisations, getDoctors } from "../api";
import DoctorCard from "../components/DoctorCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SearchPage() {
  const [cities, setCities] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [filters, setFilters] = useState({
    city_id: "", specialisation: "", budget: "", availability_pref: "", min_rating: ""
  });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "doctor") {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  useEffect(() => {
    getCities().then(r => setCities(r.data));
    getSpecialisations().then(r => setSpecs(r.data));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true); setSearched(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
    try {
      const res = await getDoctors(params);
      setDoctors(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({ city_id: "", specialisation: "", budget: "", availability_pref: "", min_rating: "" });
    setDoctors([]); setSearched(false);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Find a Doctor</h1>
        <p>Filter and discover the best doctors near you</p>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>City</label>
              <select value={filters.city_id} onChange={e => setFilters({ ...filters, city_id: e.target.value })}>
                <option value="">All cities</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Specialisation</label>
              <select value={filters.specialisation} onChange={e => setFilters({ ...filters, specialisation: e.target.value })}>
                <option value="">All</option>
                {specs.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Budget</label>
              <select value={filters.budget} onChange={e => setFilters({ ...filters, budget: e.target.value })}>
                <option value="">Any</option>
                <option value="low">Low (₹400)</option>
                <option value="medium">Medium (₹900)</option>
                <option value="high">High (₹2500)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Availability</label>
              <select value={filters.availability_pref} onChange={e => setFilters({ ...filters, availability_pref: e.target.value })}>
                <option value="">Any</option>
                <option value="green">Available Now</option>
                <option value="yellow">Busy (has slot)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Min Rating</label>
              <select value={filters.min_rating} onChange={e => setFilters({ ...filters, min_rating: e.target.value })}>
                <option value="">Any</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
            <button className="btn btn-outline" type="button" onClick={handleReset}>Reset</button>
          </div>
        </form>
      </div>

      {/* Results */}
      {searched && !loading && (
        <p style={{ marginBottom: 12, color: "#718096", fontSize: "0.88rem" }}>
          {doctors.length > 0 ? `${doctors.length} doctor(s) found` : "No doctors match your filters."}
        </p>
      )}
      {doctors.map(d => <DoctorCard key={d.id} doctor={d} />)}
    </div>
  );
}