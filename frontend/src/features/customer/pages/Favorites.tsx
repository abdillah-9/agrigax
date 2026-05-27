import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiSearch, HiStar, HiClipboardList, HiLocationMarker, HiTrash, HiArrowRight } from "react-icons/hi";
import "../styles/customer.css";

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
    <main className="customer-page">
      <div className="customer-page-header">
        <div>
          <h1 className="customer-page-title">Favorite Providers</h1>
          <p className="customer-page-subtitle">{favorites.length} saved providers</p>
        </div>
      </div>

      <div className="customer-search-wrap">
        <HiSearch className="customer-search-icon" />
        <input
          className="customer-search-input"
          placeholder="Search favorites..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="favorites-grid">
        {filtered.map(fav => (
          <div key={fav.id} className="favorite-card">
            <div className="favorite-card-header">
              <div className="favorite-avatar">{fav.initials}</div>
              <div>
                <h3 className="favorite-name">{fav.name}</h3>
                <p className="favorite-category">{fav.category}</p>
              </div>
            </div>
            <div className="favorite-stats">
              <span className="favorite-stat"><HiStar className="favorite-stat-icon star-icon" /> {fav.rating}</span>
              <span className="favorite-stat"><HiClipboardList className="favorite-stat-icon" /> {fav.totalServices} listings</span>
              <span className="favorite-stat favorite-stat-location"><HiLocationMarker className="favorite-stat-icon" /> {fav.location}</span>
            </div>
            <div className="favorite-actions">
              <button className="dash-action-btn" onClick={() => navigate("/app/listings")}>
                <span>View Listings</span>
                <HiArrowRight className="dash-btn-icon" />
              </button>
              <button className="favorite-remove-btn" onClick={() => handleRemove(fav.id)}>
                <HiTrash className="dash-btn-icon" />
                <span>Remove</span>
              </button>
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
