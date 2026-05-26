import { useState } from "react";

const demoBookings = [
  { id: "BK-001", customer: "Juma Mwakyoma", provider: "Kilimo Best Supplies", service: "Tractor Rental", amount: 150000, status: "completed", date: "2026-05-20" },
  { id: "BK-002", customer: "Fatima Jabir", provider: "AgriPro Solutions", service: "Seeds Supply", amount: 85000, status: "pending", date: "2026-05-20" },
  { id: "BK-003", customer: "David Shayo", provider: "Farm Help Services", service: "Irrigation Setup", amount: 320000, status: "in-progress", date: "2026-05-19" },
  { id: "BK-004", customer: "Grace Mushi", provider: "Green Tech Agri", service: "Soil Testing", amount: 45000, status: "disputed", date: "2026-05-19" },
  { id: "BK-005", customer: "Peter Tembo", provider: "Kilimo Best Supplies", service: "Harvesting", amount: 200000, status: "completed", date: "2026-05-18" },
  { id: "BK-006", customer: "Zainab Ally", provider: "Tanzania Livestock Co", service: "Dairy Cows", amount: 1200000, status: "accepted", date: "2026-05-18" },
  { id: "BK-007", customer: "John Banda", provider: "AgriPro Solutions", service: "Fertilizer Supply", amount: 65000, status: "cancelled", date: "2026-05-17" },
];

export default function Bookings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = demoBookings.filter(b => {
    const matchSearch = b.customer.toLowerCase().includes(search.toLowerCase()) || b.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      completed: "badge badge-success",
      pending: "badge badge-warning",
      "in-progress": "badge badge-info",
      disputed: "badge badge-danger",
      accepted: "badge badge-info",
      cancelled: "badge badge-default",
    };
    return <span className={classes[status] || "badge badge-default"}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Bookings</h1>
        <p className="page-subtitle">View and manage customer bookings</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Bookings</div>
            <div className="inv-toolbar-sub">{filtered.length} bookings</div>
          </div>
          <div className="inv-toolbar-right">
            <select className="input-select" style={{ width: "auto" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(booking => (
              <tr key={booking.id}>
                <td className="fw-medium">{booking.id}</td>
                <td>{booking.customer}</td>
                <td>{booking.provider}</td>
                <td>{booking.service}</td>
                <td>TZS {booking.amount.toLocaleString()}</td>
                <td>{getStatusBadge(booking.status)}</td>
                <td>{booking.date}</td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">View</button>
                    <button className="inv-action-btn inv-action-btn-secondary">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
