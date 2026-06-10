import { useState } from "react";
import {
  HiMagnifyingGlass,
  HiCheck,
  HiXMark,
  HiEye,
  HiPhone,
  HiClipboardDocumentList,
  HiCalendar,
  HiMapPin,
  HiCurrencyDollar,
} from "react-icons/hi2";
import "../styles/bookings.css";

const initialBookings = [
  { id: "BK-001", customer: "Abdillah Suleiman", service: "Tractor Rental", date: "2026-05-20", location: "Morogoro", amount: "TZS 120,000", status: "pending" },
  { id: "BK-006", customer: "Zainab Ally", service: "Irrigation Setup", date: "2026-05-22", location: "Dar es Salaam", amount: "TZS 350,000", status: "pending" },
  { id: "BK-007", customer: "Peter Tembo", service: "Tractor Rental", date: "2026-05-18", location: "Dodoma", amount: "TZS 120,000", status: "accepted" },
  { id: "BK-008", customer: "Grace Mushi", service: "Harvesting", date: "2026-05-15", location: "Mwanza", amount: "TZS 200,000", status: "completed" },
  { id: "BK-009", customer: "Juma Mwakyoma", service: "Fertilizer Supply", date: "2026-05-25", location: "Mbeya", amount: "TZS 65,000", status: "cancelled" },
  { id: "BK-010", customer: "Fatima Jabir", service: "Soil Testing", date: "2026-05-21", location: "Arusha", amount: "TZS 45,000", status: "accepted" },
];

export default function ProviderBookings() {
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<typeof initialBookings[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const filtered = bookings.filter(b => {
    const matchSearch = b.customer.toLowerCase().includes(search.toLowerCase()) ||
                        b.service.toLowerCase().includes(search.toLowerCase()) ||
                        b.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (sortOrder === "newest") filtered.sort((a, b) => b.date.localeCompare(a.date));
  if (sortOrder === "oldest") filtered.sort((a, b) => a.date.localeCompare(b.date));
  if (sortOrder === "highest") filtered.sort((a, b) => parseInt(b.amount.replace(/\D/g, "")) - parseInt(a.amount.replace(/\D/g, "")));
  if (sortOrder === "lowest") filtered.sort((a, b) => parseInt(a.amount.replace(/\D/g, "")) - parseInt(b.amount.replace(/\D/g, "")));

  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const acceptedCount = bookings.filter(b => b.status === "accepted").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;

  const handleAccept = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "accepted" } : b));
    alert("Booking accepted! Customer will be notified.");
  };

  const handleReject = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    alert("Booking rejected.");
  };

  const handleViewDetails = (booking: typeof initialBookings[0]) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending": return "booking-status-pending";
      case "accepted": return "booking-status-accepted";
      case "completed": return "booking-status-completed";
      case "cancelled": return "booking-status-cancelled";
      default: return "";
    }
  };

  return (
    <main className="customer-page">
      {/* Header Banner */}
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

      {/* Search & Filters */}
      <div className="bookings-filters-row">
        <div className="bookings-search-wrap">
          <HiMagnifyingGlass className="listings-search-icon" />
          <input
            className="bookings-search-input"
            style={{ paddingLeft: 42 }}
            placeholder="Search by customer, service, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="bookings-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="bookings-filter-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>

      <p className="bookings-count-text">{filtered.length} booking{filtered.length !== 1 ? "s" : ""} found</p>

      {/* Bookings List */}
      <section className="bookings-list">
        {filtered.map(booking => (
          <div key={booking.id} className="booking-card">
            <div className="booking-top">
              <div className="booking-top-left">
                <div className={`booking-avatar booking-avatar-${booking.status}`}>
                  {booking.customer.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h3 className="booking-service-name">{booking.service}</h3>
                  <p className="booking-customer-name">Requested by {booking.customer}</p>
                </div>
              </div>
              <span className={`booking-status ${getStatusClass(booking.status)}`}>
                {booking.status}
              </span>
            </div>

            <div className="booking-details">
              <div className="booking-detail-item">
                <HiCalendar className="booking-detail-icon" />
                <span className="fw-semibold">Date:</span>
                <span>{booking.date}</span>
              </div>
              <div className="booking-detail-item">
                <HiMapPin className="booking-detail-icon" />
                <span className="fw-semibold">Location:</span>
                <span>{booking.location}</span>
              </div>
              <div className="booking-detail-item">
                <HiCurrencyDollar className="booking-detail-icon" />
                <span className="fw-semibold">Amount:</span>
                <span className="booking-amount">{booking.amount}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {booking.status === "pending" && (
              <div className="booking-actions">
                <button className="booking-btn-accept" onClick={() => handleAccept(booking.id)}>
                  <HiCheck className="booking-btn-icon" /> Accept
                </button>
                <button className="booking-btn-reject" onClick={() => handleReject(booking.id)}>
                  <HiXMark className="booking-btn-icon" /> Reject
                </button>
              </div>
            )}
            {(booking.status === "accepted" || booking.status === "completed") && (
              <div className="booking-actions">
                <button className="booking-btn-view" onClick={() => handleViewDetails(booking)}>
                  <HiEye className="booking-btn-icon" /> View Details
                </button>
                <button className="booking-btn-contact" onClick={() => alert(`Contacting ${booking.customer}...`)}>
                  <HiPhone className="booking-btn-icon" /> Contact Customer
                </button>
              </div>
            )}
            {booking.status === "cancelled" && (
              <div className="booking-actions">
                <button className="booking-btn-view" onClick={() => handleViewDetails(booking)}>
                  <HiEye className="booking-btn-icon" /> View Details
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="table-empty">
            <p>No bookings match your filters.</p>
          </div>
        )}
      </section>

      {/* Details Modal */}
      {showDetails && selectedBooking && (
        <div className="provider-modal-backdrop" onClick={() => setShowDetails(false)}>
          <div className="provider-modal" onClick={e => e.stopPropagation()}>
            <div className="provider-modal-header">
              <div className="provider-modal-header-left">
                <div className="provider-modal-icon-wrap provider-modal-icon-booking">
                  <HiClipboardDocumentList />
                </div>
                <div>
                  <h3 className="provider-modal-title">Booking Details</h3>
                  <p className="provider-modal-subtitle">{selectedBooking.id}</p>
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
                  <span>{selectedBooking.service}</span>
                </div>
                <div className="booking-detail-modal-row">
                  <span className="fw-semibold">Customer:</span>
                  <span>{selectedBooking.customer}</span>
                </div>
                <div className="booking-detail-modal-row">
                  <span className="fw-semibold">Date:</span>
                  <span>{selectedBooking.date}</span>
                </div>
                <div className="booking-detail-modal-row">
                  <span className="fw-semibold">Location:</span>
                  <span>{selectedBooking.location}</span>
                </div>
                <div className="booking-detail-modal-row">
                  <span className="fw-semibold">Amount:</span>
                  <span className="booking-amount">{selectedBooking.amount}</span>
                </div>
                <div className="booking-detail-modal-row">
                  <span className="fw-semibold">Status:</span>
                  <span className={`booking-status ${getStatusClass(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="provider-modal-footer">
              <button className="btn-report" onClick={() => setShowDetails(false)}>Close</button>
              {selectedBooking.status === "pending" && (
                <>
                  <button className="booking-btn-reject" onClick={() => { handleReject(selectedBooking.id); setShowDetails(false); }}>
                    <HiXMark className="booking-btn-icon" /> Reject
                  </button>
                  <button className="booking-btn-accept" onClick={() => { handleAccept(selectedBooking.id); setShowDetails(false); }}>
                    <HiCheck className="booking-btn-icon" /> Accept
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
