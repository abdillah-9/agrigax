import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiPlus,
  HiStar,
  HiPencilSquare,
  HiTrash,
  HiExclamationTriangle,
  HiXMark,
  HiEye,
  HiFunnel,
  HiCheckCircle,
  HiMinusCircle,
  HiClock,
} from "react-icons/hi2";
import { useListings } from "../../../hooks/useListings";
import { useCategories } from "../../../hooks/useCategories";
import { categoryNameById, listingImageStyle } from "../../../api/listingHelpers";
import type { Category, Listing } from "../../../types/api.types";
import "../styles/listings.css";

type StatusFilter = "all" | "active" | "inactive" | "pending";

export default function MyListings() {
  const navigate = useNavigate();
  const { fetchMyListings, deleteListing, loading, error } = useListings();
  const { fetchCategories } = useCategories();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadListings = useCallback(async () => {
    const items = await fetchMyListings();
    setListings(items);
  }, [fetchMyListings]);

  useEffect(() => {
    loadListings();
    fetchCategories().then(setCategories);
  }, [loadListings, fetchCategories]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return l.isAvailable && l.isApproved;
      if (statusFilter === "inactive") return !l.isAvailable;
      if (statusFilter === "pending") return !l.isApproved;
      return true;
    });
  }, [listings, statusFilter]);

  const activeCount = listings.filter((l) => l.isAvailable && l.isApproved).length;
  const inactiveCount = listings.filter((l) => !l.isAvailable).length;
  const pendingCount = listings.filter((l) => !l.isApproved).length;
  const avgRating =
    listings.length > 0
      ? listings.reduce((sum, l) => sum + l.ratingAvg, 0) / listings.length
      : 0;

  async function handleDelete(id: string) {
    setDeleting(true);
    const ok = await deleteListing(id);
    setDeleting(false);

    if (ok) {
      setShowDeleteConfirm(null);
      await loadListings();
    }
  }

  return (
    <main className="customer-page">
      <div className="dash-welcome my-listings-banner">
        <div className="dash-welcome-content">
          <div className="dash-welcome-text">
            <p className="dash-welcome-greeting">Provider Dashboard</p>
            <h1 className="dash-welcome-name">My Listings</h1>
            <p className="dash-welcome-subtitle">
              Manage your {listings.length} listings · {activeCount} active, {pendingCount} pending
            </p>
          </div>
          <button
            className="dash-action-btn dash-action-btn-primary"
            onClick={() => navigate("/provider/listings/create")}
          >
            <HiPlus className="dash-btn-icon" />
            <span>Create Listing</span>
          </button>
        </div>
      </div>

      {error && <p className="listings-count-text" style={{ color: "#b42318" }}>{error}</p>}

      <div className="dashboard-grid">
        <div className="dash-stat-card dash-stat-green">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-green">
              <HiCheckCircle />
            </div>
            <div>
              <p className="dash-stat-label">Active Listings</p>
              <p className="dash-stat-value dash-stat-value-green">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="dash-stat-card dash-stat-blue">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-blue">
              <HiClock />
            </div>
            <div>
              <p className="dash-stat-label">Pending Approval</p>
              <p className="dash-stat-value dash-stat-value-blue">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="dash-stat-card dash-stat-gold">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-gold">
              <HiStar />
            </div>
            <div>
              <p className="dash-stat-label">Avg Rating</p>
              <p className="dash-stat-value dash-stat-value-gold">{avgRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="my-listings-tabs">
        {[
          { key: "all" as const, label: "All", count: listings.length },
          { key: "active" as const, label: "Active", count: activeCount },
          { key: "pending" as const, label: "Pending", count: pendingCount },
          { key: "inactive" as const, label: "Inactive", count: inactiveCount },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`my-listings-tab ${statusFilter === tab.key ? "tab-active" : ""}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            <span>{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {loading && listings.length === 0 ? (
        <p className="listings-count-text">Loading your listings...</p>
      ) : (
        <section className="my-listings-grid">
          {filtered.map((listing) => (
            <div key={listing.id} className="my-listing-card">
              <div className="my-listing-image" style={listingImageStyle(listing)}>
                <div className="my-listing-image-overlay">
                  <span
                    className={`my-listing-status-badge ${
                      listing.isAvailable && listing.isApproved ? "status-active" : "status-inactive"
                    }`}
                  >
                    {!listing.isApproved ? (
                      <>
                        <HiClock className="status-icon" /> Pending
                      </>
                    ) : listing.isAvailable ? (
                      <>
                        <HiCheckCircle className="status-icon" /> Active
                      </>
                    ) : (
                      <>
                        <HiMinusCircle className="status-icon" /> Inactive
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="my-listing-body">
                <div className="my-listing-info">
                  <h3 className="my-listing-title">{listing.title}</h3>
                  <span className="my-listing-category">
                    {categoryNameById(categories, listing.categoryId)}
                  </span>
                </div>

                <div className="my-listing-stats">
                  <div className="my-listing-stat">
                    <span className="my-listing-price">TZS {listing.price.toLocaleString()}</span>
                  </div>
                  <div className="my-listing-stat">
                    <HiStar className="stat-star" />
                    <span>{listing.ratingAvg.toFixed(1)}</span>
                  </div>
                  <div className="my-listing-stat">
                    <span className="stat-label">{listing.ratingCount} reviews</span>
                  </div>
                  <div className="my-listing-stat">
                    <span className="stat-label">{listing.views.toLocaleString()} views</span>
                  </div>
                </div>

                <div className="my-listing-actions">
                  <button
                    className="my-listing-btn my-listing-btn-edit"
                    onClick={() => navigate(`/provider/listings/edit/${listing.id}`)}
                  >
                    <HiPencilSquare />
                    Edit
                  </button>
                  <button
                    className="my-listing-btn my-listing-btn-view"
                    onClick={() => navigate(`/provider/browse/${listing.id}`)}
                    disabled={!listing.isApproved}
                    title={!listing.isApproved ? "Visible after admin approval" : undefined}
                  >
                    <HiEye />
                    View
                  </button>
                  <button
                    className="my-listing-btn my-listing-btn-delete"
                    onClick={() => setShowDeleteConfirm(listing.id)}
                  >
                    <HiTrash />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="listings-empty">
              <div className="listings-empty-icon">
                <HiFunnel />
              </div>
              <h3 className="listings-empty-title">No listings found</h3>
              <p className="listings-empty-text">
                {listings.length === 0
                  ? "Create your first listing to get started"
                  : "Try changing your filter"}
              </p>
            </div>
          )}
        </section>
      )}

      {showDeleteConfirm && (
        <div className="provider-modal-backdrop" onClick={() => setShowDeleteConfirm(null)}>
          <div className="provider-modal" onClick={(e) => e.stopPropagation()}>
            <div className="provider-modal-header">
              <div className="provider-modal-header-left">
                <div className="provider-modal-icon-wrap provider-modal-icon-danger">
                  <HiExclamationTriangle />
                </div>
                <div>
                  <h3 className="provider-modal-title">Delete Listing</h3>
                  <p className="provider-modal-subtitle">This action cannot be undone</p>
                </div>
              </div>
              <button className="provider-modal-close" onClick={() => setShowDeleteConfirm(null)}>
                <HiXMark />
              </button>
            </div>
            <div className="provider-modal-body">
              <p className="delete-confirm-text">
                Are you sure you want to delete this listing? It will be removed from the marketplace.
              </p>
            </div>
            <div className="provider-modal-footer">
              <button className="btn-report" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="btn-delete-confirm"
                disabled={deleting}
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                <HiTrash className="dash-btn-icon" />
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
