import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HiMagnifyingGlass,
  HiCheck,
  HiXMark,
  HiEye,
  HiClipboardDocumentList,
  HiCalendar,
  HiMapPin,
  HiCurrencyDollar,
} from "react-icons/hi2";
import { useBookings } from "../../../hooks/useBookings";
import {
  clearBookingLookupCache,
  enrichBookings,
  formatBookingAmount,
  formatBookingDate,
  providerStatusClass,
} from "../../../api/bookingHelpers";
import type { EnrichedBooking } from "../../../types/api.types";
import "../styles/bookings.css";

export default function ProviderBookings() {
  const {
    fetchProviderBookings,
    acceptBooking,
    rejectBooking,
    completeBooking,
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
    const rows = await fetchProviderBookings();
    const enriched = await enrichBookings(rows);
    setBookings(enriched);
  }, [fetchProviderBookings]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filtered = useMemo(() => {
    let items = bookings.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        b.customerName.toLowerCase().includes(q) ||
        b.serviceTitle.toLowerCase().includes(q) ||
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

  async function runAction(action: (id: string) => Promise<unknown>, id: string) {
    setActionLoading(true);
    const result = await action(id);
    setActionLoading(false);
    if (!result) return;
    await loadBookings();
    setShowDetails(false);
  }

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const acceptedCount = bookings.filter((b) => b.status === "accepted").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <main className="customer-page">
      <div className="bookings-header-banner">
        <div className="bookings-header-content">
          <div>
            <p className="bookings-header-badge">Provider Dashboard</p>
            <h1 className="bookings-header-title">Booking Requests</h1>
            <p className="bookings-header-subtitle">Manage customer booking requests</p>
          </div>
          <div className="bookings-header-stats">
            <div className="bookings-stat-item">
              <span className="bookings-stat-number">{pendingCount}</span>
              <span className="bookings-stat-label">Pending</span>
            </div>
            <div className="bookings-stat-divider" />
            <div className="bookings-stat-item">
              <span className="bookings-stat-number">{acceptedCount}</span>
              <span className="bookings-stat-label">Accepted</span>
            </div>
            <div className="bookings-stat-divider" />
            <div className="bookings-stat-item">
              <span className="bookings-stat-number">{completedCount}</span>
              <span className="bookings-stat-label">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="bookings-count-text" style={{ color: "#b42318" }}>{error}</p>}

      <div className="bookings-filters-row">
        <div className="bookings-search-wrap">
          <HiMagnifyingGlass className="listings-search-icon" />
          <input
            className="bookings-search-input"
            style={{ paddingLeft: 42 }}
            placeholder="Search by customer, service, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="bookings-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="bookings-filter-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
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
          <div key={booking.id} className="booking-card">
            <div className="booking-top">
              <div className="booking-top-left">
                <div className={`booking-avatar booking-avatar-${booking.status}`}>
                  {booking.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h3 className="booking-service-name">{booking.serviceTitle}</h3>
                  <p className="booking-customer-name">Requested by {booking.customerName}</p>
                </div>
              </div>
              <span className={`booking-status ${providerStatusClass(booking.status)}`}>
                {booking.status}
              </span>
            </div>

            <div className="booking-details">
              <div className="booking-detail-item">
                <HiCalendar className="booking-detail-icon" />
                <span className="fw-semibold">Date:</span>
                <span>{formatBookingDate(booking.scheduledAt)}</span>
              </div>
              <div className="booking-detail-item">
                <HiMapPin className="booking-detail-icon" />
                <span className="fw-semibold">Location:</span>
                <span>{booking.location}</span>
              </div>
              <div className="booking-detail-item">
                <HiCurrencyDollar className="booking-detail-icon" />
                <span className="fw-semibold">Amount:</span>
                <span className="booking-amount">{formatBookingAmount(booking.price)}</span>
              </div>
            </div>

            {booking.status === "pending" && (
              <div className="booking-actions">
                <button
                  className="booking-btn-accept"
                  disabled={actionLoading}
                  onClick={() => runAction(acceptBooking, booking.id)}
                >
                  <HiCheck className="booking-btn-icon" /> Accept
                </button>
                <button
                  className="booking-btn-reject"
                  disabled={actionLoading}
                  onClick={() => runAction(rejectBooking, booking.id)}
                >
                  <HiXMark className="booking-btn-icon" /> Reject
                </button>
              </div>
            )}

            {booking.status === "accepted" && (
              <div className="booking-actions">
                <button
                  className="booking-btn-accept"
                  disabled={actionLoading}
                  onClick={() => runAction(completeBooking, booking.id)}
                >
                  <HiCheck className="booking-btn-icon" /> Mark Complete
                </button>
                <button className="booking-btn-view" onClick={() => { setSelectedBooking(booking); setShowDetails(true); }}>
                  <HiEye className="booking-btn-icon" /> View Details
                </button>
              </div>
            )}

            {(booking.status === "completed" || booking.status === "cancelled" || booking.status === "rejected") && (
              <div className="booking-actions">
                <button className="booking-btn-view" onClick={() => { setSelectedBooking(booking); setShowDetails(true); }}>
                  <HiEye className="booking-btn-icon" /> View Details
                </button>
              </div>
            )}
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="table-empty">
            <p>No bookings match your filters.</p>
          </div>
        )}
      </section>

      {showDetails && selectedBooking && (
        <div className="provider-modal-backdrop" onClick={() => setShowDetails(false)}>
          <div className="provider-modal" onClick={(e) => e.stopPropagation()}>
            <div className="provider-modal-header">
              <div className="provider-modal-header-left">
                <div className="provider-modal-icon-wrap provider-modal-icon-booking">
                  <HiClipboardDocumentList />
                </div>
                <div>
                  <h3 className="provider-modal-title">Booking Details</h3>
                  <p className="provider-modal-subtitle">#{selectedBooking.id}</p>
                </div>
              </div>
              <button className="provider-modal-close" onClick={() => setShowDetails(false)}>
                <HiXMark />
              </button>
            </div>
            <div className="provider-modal-body">
              <div className="booking-details-modal">
                <div className="booking-detail-modal-row">
                  <span className="fw-semibold">Service:</span>
                  <span>{selectedBooking.serviceTitle}</span>
                </div>
                <div className="booking-detail-modal-row">
                  <span className="fw-semibold">Customer:</span>
                  <span>{selectedBooking.customerName}</span>
                </div>
                <div className="booking-detail-modal-row">
                  <span className="fw-semibold">Date:</span>
                  <span>{formatBookingDate(selectedBooking.scheduledAt)}</span>
                </div>
                <div className="booking-detail-modal-row">
                  <span className="fw-semibold">Location:</span>
                  <span>{selectedBooking.location}</span>
                </div>
                <div className="booking-detail-modal-row">
                  <span className="fw-semibold">Amount:</span>
                  <span className="booking-amount">{formatBookingAmount(selectedBooking.price)}</span>
                </div>
                {selectedBooking.notes && (
                  <div className="booking-detail-modal-row">
                    <span className="fw-semibold">Notes:</span>
                    <span>{selectedBooking.notes}</span>
                  </div>
                )}
                <div className="booking-detail-modal-row">
                  <span className="fw-semibold">Status:</span>
                  <span className={`booking-status ${providerStatusClass(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="provider-modal-footer">
              <button className="btn-report" onClick={() => setShowDetails(false)}>Close</button>
              {selectedBooking.status === "pending" && (
                <>
                  <button
                    className="booking-btn-reject"
                    disabled={actionLoading}
                    onClick={() => runAction(rejectBooking, selectedBooking.id)}
                  >
                    <HiXMark className="booking-btn-icon" /> Reject
                  </button>
                  <button
                    className="booking-btn-accept"
                    disabled={actionLoading}
                    onClick={() => runAction(acceptBooking, selectedBooking.id)}
                  >
                    <HiCheck className="booking-btn-icon" /> Accept
                  </button>
                </>
              )}
              {selectedBooking.status === "accepted" && (
                <button
                  className="booking-btn-accept"
                  disabled={actionLoading}
                  onClick={() => runAction(completeBooking, selectedBooking.id)}
                >
                  <HiCheck className="booking-btn-icon" /> Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
