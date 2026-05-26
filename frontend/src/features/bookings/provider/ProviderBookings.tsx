import { useState } from "react";
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

  return (
    <main className="p-xl">
      <div className="bookings-header mb-xl">
        <div>
          <h1 className="text-2xl fw-bold neutral-dark">Booking Requests</h1>
          <p className="text-sm mt-sm">Manage customer booking requests · <span className="badge badge-warning">{pendingCount} pending</span></p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-md mb-lg items-center" style={{ flexWrap: "wrap" }}>
        <div className="inv-search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <input
            className="inv-search"
            style={{ width: "100%" }}
            placeholder="Search by customer, service, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input-select" style={{ width: "auto" }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="input-select" style={{ width: "auto" }} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>

      <p className="text-sm text-muted mb-lg">{filtered.length} booking{filtered.length !== 1 ? "s" : ""} found</p>

      <section className="bookings-list">
        {filtered.map(booking => (
          <div key={booking.id} className="booking-card shadow-md radius-lg">
            <div className="booking-top">
              <div>
                <h3 className="text-lg fw-semibold">{booking.service}</h3>
                <p className="text-sm mt-sm">Requested by {booking.customer}</p>
              </div>
              <span className={`booking-status ${booking.status === "pending" ? "pending-status" : booking.status === "accepted" ? "confirmed-status" : booking.status === "completed" ? "confirmed-status" : "pending-status"}`}>
                {booking.status}
              </span>
            </div>
            <div className="booking-details">
              <div className="booking-detail-item"><span className="fw-semibold">Date:</span><span>{booking.date}</span></div>
              <div className="booking-detail-item"><span className="fw-semibold">Location:</span><span>{booking.location}</span></div>
              <div className="booking-detail-item"><span className="fw-semibold">Amount:</span><span className="primary-base fw-bold">{booking.amount}</span></div>
            </div>
            {booking.status === "pending" && (
              <div className="booking-actions">
                <button className="booking-primary-btn" onClick={() => handleAccept(booking.id)}>Accept</button>
                <button className="booking-danger-btn" onClick={() => handleReject(booking.id)}>Reject</button>
              </div>
            )}
            {(booking.status === "accepted" || booking.status === "completed") && (
              <div className="booking-actions">
                <button className="booking-outline-btn" onClick={() => handleViewDetails(booking)}>View Details</button>
                <button className="booking-primary-btn" onClick={() => alert(`Contacting ${booking.customer}...`)}>Contact Customer</button>
              </div>
            )}
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
                <div className="flex justify-between"><span className="fw-semibold">Customer:</span><span>{selectedBooking.customer}</span></div>
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
