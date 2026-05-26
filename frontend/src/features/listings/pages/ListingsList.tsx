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

  // Determine base path for navigation
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
    <main className="p-xl">
      <div className="services-header">
        <div>
          <h1 className="text-2xl fw-bold neutral-dark">Browse Listings</h1>
          <p className="text-sm mt-sm">Explore available agricultural listings</p>
        </div>
        <button className="services-filter-btn" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? "✕ Close" : "☰ Filters"} {showFilters ? "" : `(${filtered.length})`}
        </button>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex gap-md mt-lg items-center" style={{ flexWrap: "wrap" }}>
        <div className="inv-search-wrap" style={{ flex: 1, minWidth: 250 }}>
          <input
            className="inv-search"
            style={{ width: "100%" }}
            placeholder="Search by name, provider, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input-select" style={{ width: "auto" }} value={priceSort} onChange={e => setPriceSort(e.target.value)}>
          <option value="none">Sort by Price</option>
          <option value="low">Lowest First</option>
          <option value="high">Highest First</option>
        </select>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="form-section mt-lg">
          <div className="flex gap-xl" style={{ flexWrap: "wrap" }}>
            <div style={{ minWidth: 200 }}>
              <label className="label">Category</label>
              <select className="input-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ minWidth: 200 }}>
              <label className="label">Type</label>
              <select className="input-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                {types.map(t => <option key={t} value={t} style={{ textTransform: "capitalize" }}>{t}</option>)}
              </select>
            </div>
            <div style={{ minWidth: 150, display: "flex", alignItems: "flex-end" }}>
              <button className="btn btn-outline btn-sm" onClick={() => { setCategoryFilter("all"); setTypeFilter("all"); setSearch(""); setPriceSort("none"); }}>
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted mt-md">{filtered.length} listing{filtered.length !== 1 ? "s" : ""} found</p>

      {/* Listings Grid */}
      {filtered.length > 0 ? (
        <section className="services-grid mt-lg">
          {filtered.map(listing => (
            <div key={listing.id} className="service-card shadow-md radius-lg">
              <div className="service-image" />
              <div className="service-content">
                <div className="flex gap-sm mb-sm">
                  <span className="badge badge-info text-xs">{listing.type}</span>
                  <span className="badge badge-default text-xs">{listing.category}</span>
                </div>
                <h3 className="text-lg fw-semibold">{listing.title}</h3>
                <p className="text-sm mt-sm">{listing.provider}</p>
                <div className="flex gap-lg mt-sm">
                  <span className="text-sm">⭐ {listing.rating}</span>
                  <span className="text-sm text-muted">📍 {listing.location}</span>
                </div>
                <div className="service-footer">
                  <span className="service-price">TZS {listing.price.toLocaleString()}</span>
                  <button className="service-btn" onClick={() => navigate(`${basePath}/${listing.id}`)}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="table-empty mt-xl">
          <p>No listings match your search. Try adjusting your filters.</p>
        </div>
      )}
    </main>
  );
}
