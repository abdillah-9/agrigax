import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/listings.css";

const allListings = [
  { id: "1", title: "Tractor Rental", provider: "Kilimo Best", category: "Farm Equipment", type: "equipment", price: 120000, rating: 4.8, location: "Morogoro" },
  { id: "2", title: "Irrigation Setup", provider: "Green Tech", category: "Irrigation", type: "service", price: 350000, rating: 4.6, location: "Dar es Salaam" },
  { id: "3", title: "Organic Seeds", provider: "AgriPro", category: "Seeds", type: "product", price: 25000, rating: 4.5, location: "Dodoma" },
  { id: "4", title: "Farm Labor", provider: "Farm Help", category: "Labor", type: "worker", price: 50000, rating: 4.2, location: "Arusha" },
  { id: "5", title: "Soil Testing", provider: "Green Tech", category: "Technology", type: "service", price: 45000, rating: 4.7, location: "Mwanza" },
  { id: "6", title: "Dairy Cows", provider: "Livestock Co", category: "Livestock", type: "livestock", price: 1200000, rating: 4.9, location: "Mbeya" },
  { id: "7", title: "Harvesting Machine", provider: "Kilimo Best", category: "Farm Equipment", type: "equipment", price: 200000, rating: 4.4, location: "Morogoro" },
  { id: "8", title: "Fertilizer Supply", provider: "AgriPro", category: "Farm Inputs", type: "product", price: 65000, rating: 4.3, location: "Dodoma" },
];

export default function ListingsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("none");
  const [showFilters, setShowFilters] = useState(false);

  const basePath = location.pathname.includes("/provider") ? "/provider/browse" : "/app/listings";
  const categories = [...new Set(allListings.map(l => l.category))];
  const types = [...new Set(allListings.map(l => l.type))];

  let filtered = allListings.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
                        l.provider.toLowerCase().includes(search.toLowerCase()) ||
                        l.location.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || l.category === categoryFilter;
    const matchType = typeFilter === "all" || l.type === typeFilter;
    return matchSearch && matchCategory && matchType;
  });

  if (priceSort === "low") filtered.sort((a, b) => a.price - b.price);
  if (priceSort === "high") filtered.sort((a, b) => b.price - a.price);

  return (
    <main className="customer-page">
      {/* Header Banner */}
      <div className="listings-header-banner">
        <div className="listings-header-content">
          <div>
            <p className="listings-header-badge">Browse Listings</p>
            <h1 className="listings-header-title">Discover Services</h1>
            <p className="listings-header-subtitle">Explore available agricultural listings near you</p>
          </div>
          <div className="listings-header-count">
            <span className="listings-count-number">{filtered.length}</span>
            <span className="listings-count-label">Available<br />Listings</span>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="listings-filters-row">
        <div className="listings-search-wrap">
          <input
            className="listings-search-input"
            placeholder="Search by name, provider, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="listings-filter-select" 
          value={priceSort} 
          onChange={e => setPriceSort(e.target.value)}
        >
          <option value="none">Sort by Price</option>
          <option value="low">Lowest First</option>
          <option value="high">Highest First</option>
        </select>
        <button 
          className="listings-toggle-btn" 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "✕ Hide Filters" : "☰ Filters"}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="listings-filter-panel">
          <div className="listings-filter-grid">
            <div className="listings-filter-group">
              <label className="listings-filter-label">Category</label>
              <select 
                className="listings-filter-select-full" 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="listings-filter-group">
              <label className="listings-filter-label">Type</label>
              <select 
                className="listings-filter-select-full" 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button 
              className="listings-reset-btn"
              onClick={() => { setCategoryFilter("all"); setTypeFilter("all"); setSearch(""); setPriceSort("none"); }}
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="listings-count-text">
        {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Listings Grid */}
      {filtered.length > 0 ? (
        <section className="services-grid">
          {filtered.map(listing => (
            <div key={listing.id} className="service-card">
              <div className="service-image" />
              <div className="service-content">
                <div className="service-badges">
                  <span className="service-badge service-badge-type">{listing.type}</span>
                  <span className="service-badge service-badge-category">{listing.category}</span>
                </div>
                <h3 className="service-title">{listing.title}</h3>
                <p className="service-provider">by {listing.provider}</p>
                <div className="service-meta-row">
                  <span className="service-rating">⭐ {listing.rating}</span>
                  <span className="service-location">📍 {listing.location}</span>
                </div>
                <div className="service-footer">
                  <span className="service-price">TZS {listing.price.toLocaleString()}</span>
                  <button 
                    className="service-btn" 
                    onClick={() => navigate(`${basePath}/${listing.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="listings-empty">
          <div className="listings-empty-icon">🔍</div>
          <h3 className="listings-empty-title">No listings found</h3>
          <p className="listings-empty-text">Try adjusting your search or filters</p>
        </div>
      )}
    </main>
  );
}