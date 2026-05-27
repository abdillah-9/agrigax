import { useState } from "react";
import "../styles/bookings.css";

const initialBookings = [
  { id: "BK-001", service: "Tractor Rental", provider: "Kilimo Best Supplies", date: "2026-05-20", location: "Morogoro", amount: "TZS 120,000", status: "confirmed" },
  { id: "BK-002", service: "Irrigation Installation", provider: "Agro Solutions Ltd", date: "2026-05-28", location: "Dar es Salaam", amount: "TZS 350,000", status: "pending" },
  { id: "BK-003", service: "Seeds Supply", provider: "AgriPro Solutions", date: "2026-05-18", location: "Dodoma", amount: "TZS 25,000", status: "completed" },
  { id: "BK-004", service: "Soil Testing", provider: "Green Tech Agri", date: "2026-05-15", location: "Arusha", amount: "TZS 45,000", status: "cancelled" },
  { id: "BK-005", service: "Harvesting Service", provider: "Farm Help", date: "2026-06-01", location: "Mwanza", amount: "TZS 200,000", status: "confirmed" },
];

export default function MyBookings() {
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<typeof initialBookings[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const filtered = bookings.filter(b => {
    const matchSearch = b.service.toLowerCase().includes(search.toLowerCase()) ||
                        b.provider.toLowerCase().includes(search.toLowerCase()) ||
                        b.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (sortOrder === "newest") filtered.sort((a, b) => b.date.localeCompare(a.date));
  if (sortOrder === "oldest") filtered.sort((a, b) => a.date.localeCompare(b.date));
  if (sortOrder === "highest") filtered.sort((a, b) => parseInt(b.amount.replace(/\D/g, "")) - parseInt(a.amount.replace(/\D/g, "")));
  if (sortOrder === "lowest") filtered.sort((a, b) => parseInt(a.amount.replace(/\D/g, "")) - parseInt(b.amount.replace(/\D/g, "")));

  const handleCancel = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    alert("Booking cancelled.");
  };

  const handlePay = (id: string) => {
    alert("Redirecting to payment..."+id);
  };

  const handleViewDetails = (booking: typeof initialBookings[0]) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  return (
    <main className="p-xl">
 {/* Header Banner */}
  <div className="bookings-header-banner">
    <div className="bookings-header-content">
      <div>
        <p className="bookings-header-badge">My Bookings</p>
        <h1 className="bookings-header-title">Track & Manage</h1>
        <p className="bookings-header-subtitle">View and manage all your service bookings</p>
      </div>
      <div className="bookings-header-stats">
        <div className="bookings-stat-item">
          <span className="bookings-stat-number">{bookings.filter(b => b.status === 'confirmed').length}</span>
          <span className="bookings-stat-label">Active</span>
        </div>
        <div className="bookings-stat-divider" />
        <div className="bookings-stat-item">
          <span className="bookings-stat-number">{bookings.filter(b => b.status === 'pending').length}</span>
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

  {/* Search & Filters */}
  <div className="bookings-filters-row">
    <div className="bookings-search-wrap">
      <input
        className="bookings-search-input"
        placeholder="Search by service, provider, or location..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>
    <select 
      className="bookings-filter-select" 
      value={statusFilter} 
      onChange={e => setStatusFilter(e.target.value)}
    >
      <option value="all">All Status</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
    <select 
      className="bookings-filter-select" 
      value={sortOrder} 
      onChange={e => setSortOrder(e.target.value)}
    >
      <option value="newest">Newest First</option>
      <option value="oldest">Oldest First</option>
      <option value="highest">Highest Amount</option>
      <option value="lowest">Lowest Amount</option>
    </select>
  </div>

  <p className="bookings-count-text">
    {filtered.length} booking{filtered.length !== 1 ? "s" : ""} found
  </p>


      <section className="bookings-list">
        {filtered.map(booking => (
          <div key={booking.id} className="booking-card shadow-md radius-lg">
            <div className="booking-top">
              <div>
                <h3 className="text-lg fw-semibold">{booking.service}</h3>
                <p className="text-sm mt-sm">{booking.provider}</p>
              </div>
              <span className={`booking-status ${booking.status === "confirmed" ? "confirmed-status" : booking.status === "pending" ? "pending-status" : booking.status === "completed" ? "confirmed-status" : "pending-status"}`}>
                {booking.status}
              </span>
            </div>
            <div className="booking-details">
              <div className="booking-detail-item"><span className="fw-semibold">Date:</span><span>{booking.date}</span></div>
              <div className="booking-detail-item"><span className="fw-semibold">Location:</span><span>{booking.location}</span></div>
              <div className="booking-detail-item"><span className="fw-semibold">Amount:</span><span className="primary-base fw-bold">{booking.amount}</span></div>
            </div>
            <div className="booking-actions">
              <button className="booking-outline-btn" onClick={() => handleViewDetails(booking)}>View Details</button>
              {booking.status === "pending" && (
                <button className="booking-primary-btn" onClick={() => handlePay(booking.id)}>Pay Now</button>
              )}
              {(booking.status === "pending" || booking.status === "confirmed") && (
                <button className="booking-danger-btn" onClick={() => handleCancel(booking.id)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="table-empty"><p>No bookings match your filters.</p></div>
        )}
      </section>

      {showDetails && selectedBooking && (
        <div className="inv-modal-backdrop" onClick={() => setShowDetails(false)}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div className="inv-modal-header-left">
                <span className="inv-modal-icon">📋</span>
                <div>
                  <div className="inv-modal-title">Booking Details</div>
                  <div className="inv-modal-subtitle">{selectedBooking.id}</div>
                </div>
              </div>
              <button className="inv-modal-close" onClick={() => setShowDetails(false)}>×</button>
            </div>
            <div className="inv-modal-body">
              <div className="flex flex-col gap-md">
                <div className="flex justify-between"><span className="fw-semibold">Service:</span><span>{selectedBooking.service}</span></div>
                <div className="flex justify-between"><span className="fw-semibold">Provider:</span><span>{selectedBooking.provider}</span></div>
                <div className="flex justify-between"><span className="fw-semibold">Date:</span><span>{selectedBooking.date}</span></div>
                <div className="flex justify-between"><span className="fw-semibold">Location:</span><span>{selectedBooking.location}</span></div>
                <div className="flex justify-between"><span className="fw-semibold">Amount:</span><span className="primary-base fw-bold">{selectedBooking.amount}</span></div>
                <div className="flex justify-between"><span className="fw-semibold">Status:</span><span className="badge badge-info">{selectedBooking.status}</span></div>
              </div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowDetails(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
