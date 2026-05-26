import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  return (
    <main className="p-xl">
      <div className="services-header">
        <div>
          <h1 className="text-2xl fw-bold neutral-dark">My Listings</h1>
          <p className="text-sm mt-sm">Manage your listings</p>
        </div>
        <button className="create-service-btn" onClick={() => navigate("/provider/listings/create")}>
          + Create Listing
        </button>
      </div>

      <div className="flex gap-sm mt-lg">
        {["all", "active", "inactive"].map(f => (
          <button
            key={f}
            className={`tab-btn ${statusFilter === f ? "tab-btn-active" : ""}`}
            onClick={() => setStatusFilter(f)}
            style={{ textTransform: "capitalize" }}
          >
            {f}
          </button>
        ))}
      </div>

      <section className="provider-services-list mt-lg">
        {filtered.map(listing => (
          <div key={listing.id} className="provider-service-card shadow-sm radius-lg">
            <div>
              <h3 className="fw-semibold">{listing.title}</h3>
              <p className="text-sm mt-sm">
                {listing.category} · TZS {listing.price.toLocaleString()} · {listing.bookings} bookings
              </p>
              <p className="text-sm mt-sm">⭐ {listing.rating}</p>
            </div>
            <div>
              <span className={`badge ${listing.status === "active" ? "badge-success" : "badge-default"} mb-sm`} style={{ display: "inline-block" }}>
                {listing.status}
              </span>
              <div className="provider-service-actions mt-sm">
                <button className="edit-btn" onClick={() => navigate(`/provider/listings/edit/${listing.id}`)}>Edit</button>
                <button className="delete-btn" onClick={() => setShowDeleteConfirm(listing.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="inv-modal-backdrop" onClick={() => setShowDeleteConfirm(null)}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div className="inv-modal-header-left">
                <span className="inv-modal-icon">⚠️</span>
                <div>
                  <div className="inv-modal-title">Delete Listing</div>
                  <div className="inv-modal-subtitle">This action cannot be undone</div>
                </div>
              </div>
              <button className="inv-modal-close" onClick={() => setShowDeleteConfirm(null)}>×</button>
            </div>
            <div className="inv-modal-body">
              <p>Are you sure you want to delete this listing? All associated bookings will be cancelled.</p>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="inv-btn-submit" style={{ background: "#D64545" }} onClick={() => handleDelete(showDeleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
