import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiSearch,
  HiStar,
  HiLocationMarker,
  HiTrash,
  HiArrowRight,
} from "react-icons/hi";
import { useFavorites } from "../../../hooks/useFavorites";
import { formatListingType } from "../../../api/listingHelpers";
import type { Favorite } from "../../../types/api.types";
import "../styles/customer.css";

export default function Favorites() {
  const navigate = useNavigate();
  const { fetchFavorites, removeFavorite, loading, error } = useFavorites();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    const rows = await fetchFavorites();
    setFavorites(rows);
  }, [fetchFavorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return favorites.filter((fav) => {
      const title = fav.listing?.title?.toLowerCase() || "";
      const location = fav.listing?.location?.toLowerCase() || "";
      const type = fav.listing?.type?.toLowerCase() || "";
      return title.includes(q) || location.includes(q) || type.includes(q);
    });
  }, [favorites, search]);

  async function handleRemove(listingId: string) {
    setRemovingId(listingId);
    const ok = await removeFavorite(listingId);
    setRemovingId(null);
    if (ok) await loadFavorites();
  }

  return (
    <main className="customer-page">
      <div className="customer-page-header">
        <div>
          <h1 className="customer-page-title">Favorite Listings</h1>
          <p className="customer-page-subtitle">
            {loading && favorites.length === 0
              ? "Loading..."
              : `${favorites.length} saved listing${favorites.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {error && <p className="listings-count-text" style={{ color: "#b42318" }}>{error}</p>}

      <div className="customer-search-wrap">
        <HiSearch className="customer-search-icon" />
        <input
          className="customer-search-input"
          placeholder="Search saved listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="favorites-grid">
        {filtered.map((fav) => {
          const listing = fav.listing;
          const initials = (listing?.title || "L").slice(0, 2).toUpperCase();

          return (
            <div key={fav.id} className="favorite-card">
              <div className="favorite-card-header">
                <div className="favorite-avatar">{initials}</div>
                <div>
                  <h3 className="favorite-name">{listing?.title || `Listing #${fav.listingId}`}</h3>
                  <p className="favorite-category">
                    {listing?.type ? formatListingType(listing.type) : "Listing"}
                  </p>
                </div>
              </div>
              <div className="favorite-stats">
                <span className="favorite-stat favorite-stat-location">
                  <HiLocationMarker className="favorite-stat-icon" />
                  {listing?.location || "—"}
                </span>
                <span className="favorite-stat">
                  <HiStar className="favorite-stat-icon star-icon" />
                  TZS {(listing?.price ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="favorite-actions">
                <button
                  className="dash-action-btn"
                  onClick={() => navigate(`/app/listings/${fav.listingId}`)}
                >
                  <span>View Listing</span>
                  <HiArrowRight className="dash-btn-icon" />
                </button>
                <button
                  className="favorite-remove-btn"
                  disabled={removingId === fav.listingId}
                  onClick={() => handleRemove(fav.listingId)}
                >
                  <HiTrash className="dash-btn-icon" />
                  <span>{removingId === fav.listingId ? "Removing..." : "Remove"}</span>
                </button>
              </div>
            </div>
          );
        })}

        {!loading && filtered.length === 0 && (
          <div className="table-empty">
            <p>{favorites.length === 0 ? "You have no saved listings yet." : "No favorites match your search."}</p>
          </div>
        )}
      </div>
    </main>
  );
}
