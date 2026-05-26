import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialFavorites = [
  { id: "1", name: "Kilimo Best Supplies", category: "Farm Equipment", rating: 4.8, totalServices: 24, location: "Morogoro", initials: "KB" },
  { id: "2", name: "AgriPro Solutions", category: "Seeds & Inputs", rating: 4.5, totalServices: 15, location: "Dar es Salaam", initials: "AP" },
  { id: "3", name: "Farm Help Services", category: "Labor", rating: 4.2, totalServices: 8, location: "Dodoma", initials: "FH" },
  { id: "4", name: "Green Tech Agri", category: "Irrigation", rating: 4.6, totalServices: 12, location: "Arusha", initials: "GT" },
  { id: "5", name: "Tanzania Livestock Co", category: "Livestock", rating: 4.9, totalServices: 30, location: "Mwanza", initials: "TL" },
];

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(initialFavorites);
  const [search, setSearch] = useState("");

  const filtered = favorites.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  return (
    <main className="p-xl">
      <div className="mb-xl">
        <h1 className="text-2xl fw-bold neutral-dark">Favorite Providers</h1>
        <p className="text-sm text-muted mt-xs">{favorites.length} saved providers</p>
      </div>

      <div className="inv-search-wrap mb-lg">
        <input className="inv-search" style={{ width: "100%", maxWidth: 400 }} placeholder="Search favorites..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="favorites-grid">
        {filtered.map(fav => (
          <div key={fav.id} className="dash-stat-card" style={{ padding: 20 }}>
            <div className="flex items-center gap-md mb-md">
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "linear-gradient(135deg, #4B815B, #2E7D4F)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: 16
              }}>{fav.initials}</div>
              <div>
                <h3 className="text-sm fw-semibold">{fav.name}</h3>
                <p className="text-xs text-muted">{fav.category}</p>
              </div>
            </div>
            <div className="flex gap-lg mb-md">
              <span className="text-xs">⭐ {fav.rating}</span>
              <span className="text-xs">📋 {fav.totalServices} listings</span>
              <span className="text-xs text-muted">📍 {fav.location}</span>
            </div>
            <div className="flex gap-sm">
              <button className="dash-action-btn" onClick={() => navigate("/app/listings")}>View Listings</button>
              <button className="dash-action-btn" style={{ color: "#D64545", borderColor: "#FBE3E3" }} onClick={() => handleRemove(fav.id)}>Remove</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="table-empty"><p>No favorites match your search.</p></div>
        )}
      </div>
    </main>
  );
}
