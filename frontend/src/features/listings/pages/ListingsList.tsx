import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiMagnifyingGlass,
  HiStar,
  HiMapPin,
  HiXMark,
  HiAdjustmentsHorizontal,
} from "react-icons/hi2";
import { MdMyLocation, MdMap } from "react-icons/md";
import { useListings } from "../../../hooks/useListings";
import { useCategories } from "../../../hooks/useCategories";
import ListingRouteMap from "../components/ListingRouteMap";
import { categoryNameById, formatListingType, listingImageStyle } from "../../../api/listingHelpers";
import type { Category, Listing } from "../../../types/api.types";
import "../styles/listings.css";

const LISTING_TYPES = ["service", "product", "equipment", "livestock", "worker"];

export default function ListingsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchListings, loading, error } = useListings();
  const { fetchCategories } = useCategories();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("none");
  const [showFilters, setShowFilters] = useState(false);
  const [myCoords, setMyCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState("25");
  const [locating, setLocating] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [mapListing, setMapListing] = useState<Listing | null>(null);

  const basePath = location.pathname.includes("/provider") ? "/provider/browse" : "/app/listings";

  // Debounce typing so we search the server, not on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadListings = useCallback(async () => {
    const params: Record<string, string> = {
      page: String(page),
      limit: "20",
    };

    if (categoryFilter !== "all") params.category_id = categoryFilter;
    if (typeFilter !== "all") params.type = typeFilter;
    if (debouncedSearch) params.search = debouncedSearch;
    if (myCoords) {
      params.lat = String(myCoords.lat);
      params.lng = String(myCoords.lng);
      params.radius_km = radiusKm;
    }

    const { items, pagination } = await fetchListings(params);
    setListings(items);
    setTotalPages(pagination?.totalPages || 1);
  }, [fetchListings, page, categoryFilter, typeFilter, debouncedSearch, myCoords, radiusKm]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, [fetchCategories]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const filtered = useMemo(() => {
    const items = [...listings];

    if (priceSort === "low") items.sort((a, b) => a.price - b.price);
    if (priceSort === "high") items.sort((a, b) => b.price - a.price);

    return items;
  }, [listings, priceSort]);

  // Combobox suggestions — top matches for what the user is typing
  const suggestions = useMemo(
    () => (debouncedSearch ? listings.slice(0, 6) : []),
    [debouncedSearch, listings]
  );
  const showSuggestions = searchFocused && search.trim().length > 0;

  function resetFilters() {
    setCategoryFilter("all");
    setTypeFilter("all");
    setSearch("");
    setPriceSort("none");
    setMyCoords(null);
    setNearbyError(null);
    setPage(1);
  }

  function toggleNearby() {
    setNearbyError(null);

    if (myCoords) {
      setMyCoords(null);
      setPage(1);
      return;
    }

    if (!navigator.geolocation) {
      setNearbyError("Your browser does not support location access.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPage(1);
        setLocating(false);
      },
      () => {
        setNearbyError("Could not get your location — allow location access and try again.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <main className="customer-page">
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

      <div className="listings-filters-row">
        <div className="listings-search-wrap">
          <HiMagnifyingGlass className="listings-search-icon" />
          <input
            className="listings-search-input listings-search-input-icon"
            placeholder="Search listings... e.g. maharage"
            value={search}
            role="combobox"
            aria-expanded={showSuggestions}
            autoComplete="off"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {showSuggestions && (
            <div className="search-suggestions">
              {loading && suggestions.length === 0 ? (
                <div className="search-suggestion-empty">Searching...</div>
              ) : suggestions.length === 0 ? (
                <div className="search-suggestion-empty">No listings match "{search.trim()}"</div>
              ) : (
                suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="search-suggestion-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => navigate(`${basePath}/${s.id}`)}
                  >
                    <span className="search-suggestion-title">{s.title}</span>
                    <span className="search-suggestion-meta">
                      {formatListingType(s.type)} · {s.location} · TZS {s.price.toLocaleString()}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <button
          className={`nearby-btn${myCoords ? " nearby-btn-active" : ""}`}
          onClick={toggleNearby}
          disabled={locating}
        >
          <MdMyLocation />
          {locating ? "Locating..." : myCoords ? "Near Me: ON" : "Near Me"}
        </button>
        {myCoords && (
          <select
            className="listings-filter-select"
            value={radiusKm}
            onChange={(e) => {
              setRadiusKm(e.target.value);
              setPage(1);
            }}
          >
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
            <option value="100">Within 100 km</option>
          </select>
        )}
        <select
          className="listings-filter-select"
          value={priceSort}
          onChange={(e) => setPriceSort(e.target.value)}
        >
          <option value="none">Sort by Price</option>
          <option value="low">Lowest First</option>
          <option value="high">Highest First</option>
        </select>
        <button className="listings-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? (
            <>
              <HiXMark className="listings-toggle-icon" /> Hide Filters
            </>
          ) : (
            <>
              <HiAdjustmentsHorizontal className="listings-toggle-icon" /> Filters
            </>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="listings-filter-panel">
          <div className="listings-filter-grid">
            <div className="listings-filter-group">
              <label className="listings-filter-label">Category</label>
              <select
                className="listings-filter-select-full"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="listings-filter-group">
              <label className="listings-filter-label">Type</label>
              <select
                className="listings-filter-select-full"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Types</option>
                {LISTING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {formatListingType(t)}
                  </option>
                ))}
              </select>
            </div>
            <button className="listings-reset-btn" onClick={resetFilters}>
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {error && <p className="listings-count-text" style={{ color: "#b42318" }}>{error}</p>}
      {nearbyError && <p className="listings-count-text" style={{ color: "#b42318" }}>{nearbyError}</p>}

      <p className="listings-count-text">
        {loading
          ? "Loading listings..."
          : `${filtered.length} listing${filtered.length !== 1 ? "s" : ""} found${
              myCoords ? ` within ${radiusKm} km of you, nearest first` : ""
            }`}
      </p>

      {!loading && filtered.length > 0 ? (
        <section className="services-grid">
          {filtered.map((listing) => (
            <div key={listing.id} className="service-card">
              <div className="service-image" style={listingImageStyle(listing)} />
              <div className="service-content">
                <div className="service-badges">
                  <span className="service-badge service-badge-type">{formatListingType(listing.type)}</span>
                  <span className="service-badge service-badge-category">
                    {categoryNameById(categories, listing.categoryId)}
                  </span>
                </div>
                <h3 className="service-title">{listing.title}</h3>
                <div className="service-meta-row">
                  <span className="service-rating">
                    <HiStar className="service-rating-icon" /> {listing.ratingAvg.toFixed(1)}
                  </span>
                  <span className="service-location">
                    <HiMapPin className="service-location-icon" /> {listing.location}
                  </span>
                  {listing.distanceKm !== null && (
                    <span className="service-distance">
                      <MdMyLocation /> {listing.distanceKm} km away
                    </span>
                  )}
                </div>
                <div className="service-footer">
                  <span className="service-price">TZS {listing.price.toLocaleString()}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {listing.latitude !== null && listing.longitude !== null && (
                      <button
                        className="service-map-btn"
                        title="See it on the map"
                        onClick={() => setMapListing(listing)}
                      >
                        <MdMap /> Map
                      </button>
                    )}
                    <button
                      className="service-btn"
                      onClick={() => navigate(`${basePath}/${listing.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : !loading ? (
        <div className="listings-empty">
          <div className="listings-empty-icon">
            <HiMagnifyingGlass />
          </div>
          <h3 className="listings-empty-title">No listings found</h3>
          <p className="listings-empty-text">Try adjusting your search or filters</p>
        </div>
      ) : null}

      {mapListing && (
        <div className="provider-modal-backdrop" onClick={() => setMapListing(null)}>
          <div className="provider-modal route-modal" onClick={(e) => e.stopPropagation()}>
            <div className="provider-modal-header">
              <div className="provider-modal-header-left">
                <div>
                  <h3 className="provider-modal-title">{mapListing.title}</h3>
                  <p className="provider-modal-subtitle">{mapListing.location}</p>
                </div>
              </div>
              <button className="provider-modal-close" onClick={() => setMapListing(null)}>
                <HiXMark />
              </button>
            </div>
            <div className="provider-modal-body">
              <ListingRouteMap listing={mapListing} initialUserCoords={myCoords} />
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="listings-filters-row" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          <button
            className="listings-toggle-btn"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="listings-count-text">
            Page {page} of {totalPages}
          </span>
          <button
            className="listings-toggle-btn"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
