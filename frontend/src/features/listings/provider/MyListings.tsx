import { useState } from "react";
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
} from "react-icons/hi2";
import "../styles/listings.css";

const myListings = [
  { id: "1", title: "Tractor Rental", category: "Equipment", price: 120000, status: "active", bookings: 24, rating: 4.8 },
  { id: "2", title: "Irrigation Installation", category: "Irrigation", price: 350000, status: "active", bookings: 18, rating: 4.6 },
  { id: "3", title: "Harvesting Service", category: "Labor", price: 200000, status: "active", bookings: 15, rating: 4.5 },
  { id: "4", title: "Soil Testing", category: "Technology", price: 45000, status: "inactive", bookings: 8, rating: 4.2 },
  { id: "5", title: "Fertilizer Supply", category: "Farm Inputs", price: 65000, status: "active", bookings: 32, rating: 4.7 },
];

export default function MyListings() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filtered = myListings.filter(s => statusFilter === "all" || s.status === statusFilter);

  const handleDelete = (id: string) => {
    console.log("Deleting listing:", id);
    alert("Listing deleted!");
    setShowDeleteConfirm(null);
  };

  const activeCount = myListings.filter(l => l.status === "active").length;
  const inactiveCount = myListings.filter(l => l.status === "inactive").length;

  return (
    <main className="customer-page">
      {/* Page Header */}
      <div className="dash-welcome my-listings-banner">
        <div className="dash-welcome-content">
          <div className="dash-welcome-text">
            <p className="dash-welcome-greeting">Provider Dashboard</p>
            <h1 className="dash-welcome-name">My Listings</h1>
            <p className="dash-welcome-subtitle">
              Manage your {myListings.length} listings · {activeCount} active, {inactiveCount} inactive
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

      {/* Stats Row */}
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
              <HiEye />
            </div>
            <div>
              <p className="dash-stat-label">Total Bookings</p>
              <p className="dash-stat-value dash-stat-value-blue">
                {myListings.reduce((sum, l) => sum + l.bookings, 0)}
              </p>
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
              <p className="dash-stat-value dash-stat-value-gold">
                {(myListings.reduce((sum, l) => sum + l.rating, 0) / myListings.length).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="my-listings-tabs">
        {[
          { key: "all", label: "All", count: myListings.length },
          { key: "active", label: "Active", count: activeCount },
          { key: "inactive", label: "Inactive", count: inactiveCount },
        ].map(tab => (
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

      {/* Listings Cards */}
      <section className="my-listings-grid">
        {filtered.map(listing => (
          <div key={listing.id} className="my-listing-card">
            {/* Card Image Placeholder */}
            <div className="my-listing-image">
              <div className="my-listing-image-overlay">
                <span className={`my-listing-status-badge ${listing.status === "active" ? "status-active" : "status-inactive"}`}>
                  {listing.status === "active" ? (
                    <><HiCheckCircle className="status-icon" /> Active</>
                  ) : (
                    <><HiMinusCircle className="status-icon" /> Inactive</>
                  )}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="my-listing-body">
              <div className="my-listing-info">
                <h3 className="my-listing-title">{listing.title}</h3>
                <span className="my-listing-category">{listing.category}</span>
              </div>

              <div className="my-listing-stats">
                <div className="my-listing-stat">
                  <span className="my-listing-price">TZS {listing.price.toLocaleString()}</span>
                </div>
                <div className="my-listing-stat">
                  <HiStar className="stat-star" />
                  <span>{listing.rating}</span>
                </div>
                <div className="my-listing-stat">
                  <span className="stat-label">{listing.bookings} bookings</span>
                </div>
              </div>

              {/* Action Buttons */}
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
                  onClick={() => navigate(`/app/listings/${listing.id}`)}
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

        {filtered.length === 0 && (
          <div className="listings-empty">
            <div className="listings-empty-icon">
              <HiFunnel />
            </div>
            <h3 className="listings-empty-title">No listings found</h3>
            <p className="listings-empty-text">Try changing your filter</p>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="provider-modal-backdrop" onClick={() => setShowDeleteConfirm(null)}>
          <div className="provider-modal" onClick={e => e.stopPropagation()}>
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
                Are you sure you want to delete this listing? All associated bookings will be cancelled and data will be permanently removed.
              </p>
            </div>
            <div className="provider-modal-footer">
              <button className="btn-report" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn-delete-confirm" onClick={() => handleDelete(showDeleteConfirm)}>
                <HiTrash className="dash-btn-icon" /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
