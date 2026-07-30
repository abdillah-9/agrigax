import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useBookings } from "../../../hooks/useBookings";
import {
  bookingStatusClass,
  clearBookingLookupCache,
  enrichBookings,
  formatBookingAmount,
  formatBookingDate,
} from "../../../api/bookingHelpers";
import type { EnrichedBooking } from "../../../types/api.types";
import "../styles/bookings.css";

export default function MyBookings() {
  const location = useLocation();
  const isProviderView = location.pathname.includes("/provider");
  const {
    fetchMyBookings,
    cancelBooking,
    loading,
    error,
  } = useBookings();

  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<EnrichedBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [actionLoading, setActionLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    clearBookingLookupCache();
    const rows = await fetchMyBookings();
    const enriched = await enrichBookings(rows);
    setBookings(enriched);
  }, [fetchMyBookings]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filtered = useMemo(() => {
    let items = bookings.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        b.serviceTitle.toLowerCase().includes(q) ||
        b.providerName.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });

    if (sortOrder === "newest") {
      items = [...items].sort((a, b) => (b.scheduledAt || b.createdAt).localeCompare(a.scheduledAt || a.createdAt));
    }
    if (sortOrder === "oldest") {
      items = [...items].sort((a, b) => (a.scheduledAt || a.createdAt).localeCompare(b.scheduledAt || b.createdAt));
    }
    if (sortOrder === "highest") items = [...items].sort((a, b) => b.price - a.price);
    if (sortOrder === "lowest") items = [...items].sort((a, b) => a.price - b.price);

    return items;
  }, [bookings, search, statusFilter, sortOrder]);

  async function handleCancel(id: string) {
    setActionLoading(true);
    const result = await cancelBooking(id);
    setActionLoading(false);
    if (!result) return;
    await loadBookings();
    setShowDetails(false);
  }

  const activeCount = bookings.filter((b) => b.status === "accepted").length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <main className="p-xl">
      <div className="bookings-header-banner">
        <div className="bookings-header-content">
          <div>
            <p className="bookings-header-badge">
              {isProviderView ? "Provider Account" : "My Bookings"}
            </p>
            <h1 className="bookings-header-title">Track & Manage</h1>
            <p className="bookings-header-subtitle">View and manage all your service bookings</p>
          </div>
          <div className="bookings-header-stats">
            <div className="bookings-stat-item">
              <span className="bookings-stat-number">{activeCount}</span>
              <span className="bookings-stat-label">Accepted</span>
            </div>
            <div className="bookings-stat-divider" />
            <div className="bookings-stat-item">
              <span className="bookings-stat-number">{pendingCount}</span>
              <span className="bookings-stat-label">Pending</span>
            </div>
            <div className="bookings-stat-divider" />
            <div className="bookings-stat-item">
              <span className="bookings-stat-number">{bookings.length}</span>
              <span className="bookings-stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="bookings-count-text" style={{ color: "#b42318" }}>{error}</p>}

      <div className="bookings-filters-row">
        <div className="bookings-search-wrap">
          <input
            className="bookings-search-input"
            placeholder="Search by service, provider, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bookings-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="bookings-filter-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>

      <p className="bookings-count-text">
        {loading && bookings.length === 0
          ? "Loading bookings..."
          : `${filtered.length} booking${filtered.length !== 1 ? "s" : ""} found`}
      </p>

      <section className="bookings-list">
        {filtered.map((booking) => (
          <div key={booking.id} className="booking-card shadow-md radius-lg">
            <div className="booking-top">
              <div>
                <h3 className="text-lg fw-semibold">{booking.serviceTitle}</h3>
                <p className="text-sm mt-sm">{booking.providerName}</p>
              </div>
              <span className={`booking-status ${bookingStatusClass(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <div className="booking-details">
              <div className="booking-detail-item">
                <span className="fw-semibold">Date:</span>
                <span>{formatBookingDate(booking.scheduledAt)}</span>
              </div>
              <div className="booking-detail-item">
                <span className="fw-semibold">Location:</span>
                <span>{booking.location}</span>
              </div>
              <div className="booking-detail-item">
                <span className="fw-semibold">Amount:</span>
                <span className="primary-base fw-bold">{formatBookingAmount(booking.price)}</span>
              </div>
            </div>
            {booking.providerContact?.phone && (
              <div className="booking-contact-banner">
                <span>
                  Vendor accepted — call <strong>{booking.providerContact.name}</strong> to arrange:
                </span>
                <a className="booking-call-btn" href={`tel:${booking.providerContact.phone}`}>
                  📞 {booking.providerContact.phone}
                </a>
              </div>
            )}
            <div className="booking-actions">
              <button
                className="booking-outline-btn"
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowDetails(true);
                }}
              >
                View Details
              </button>
              {(booking.status === "pending" || booking.status === "accepted") && (
                <button
                  className="booking-danger-btn"
                  disabled={actionLoading}
                  onClick={() => handleCancel(booking.id)}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="table-empty"><p>No bookings match your filters.</p></div>
        )}
      </section>

      {showDetails && selectedBooking && (
        <div className="inv-modal-backdrop" onClick={() => setShowDetails(false)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div className="inv-modal-header-left">
                <span className="inv-modal-icon">📋</span>
                <div>
                  <div className="inv-modal-title">Booking Details</div>
                  <div className="inv-modal-subtitle">#{selectedBooking.id}</div>
                </div>
              </div>
              <button className="inv-modal-close" onClick={() => setShowDetails(false)}>×</button>
            </div>
            <div className="inv-modal-body">
              <div className="flex flex-col gap-md">
                <div className="flex justify-between"><span className="fw-semibold">Service:</span><span>{selectedBooking.serviceTitle}</span></div>
                <div className="flex justify-between"><span className="fw-semibold">Provider:</span><span>{selectedBooking.providerName}</span></div>
                <div className="flex justify-between"><span className="fw-semibold">Date:</span><span>{formatBookingDate(selectedBooking.scheduledAt)}</span></div>
                <div className="flex justify-between"><span className="fw-semibold">Location:</span><span>{selectedBooking.location}</span></div>
                <div className="flex justify-between"><span className="fw-semibold">Amount:</span><span className="primary-base fw-bold">{formatBookingAmount(selectedBooking.price)}</span></div>
                {selectedBooking.notes && (
                  <div className="flex justify-between"><span className="fw-semibold">Notes:</span><span>{selectedBooking.notes}</span></div>
                )}
                <div className="flex justify-between"><span className="fw-semibold">Status:</span><span className="badge badge-info">{selectedBooking.status}</span></div>
                {selectedBooking.providerContact?.phone && (
                  <div className="flex justify-between">
                    <span className="fw-semibold">Vendor phone:</span>
                    <a className="booking-call-btn" href={`tel:${selectedBooking.providerContact.phone}`}>
                      📞 {selectedBooking.providerContact.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowDetails(false)}>Close</button>
              {(selectedBooking.status === "pending" || selectedBooking.status === "accepted") && (
                <button
                  className="booking-danger-btn"
                  disabled={actionLoading}
                  onClick={() => handleCancel(selectedBooking.id)}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
