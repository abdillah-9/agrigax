import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { formatAdminDate } from "../../../api/adminHelpers";
import type { AdminBooking } from "../../../types/api.types";

export default function Bookings() {
  const { fetchBookings, loading, error } = useAdmin();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadBookings = useCallback(async () => {
    const params: Record<string, string> = { page: "1", limit: "100" };
    if (statusFilter !== "all") params.status = statusFilter;
    const { items } = await fetchBookings(params);
    setBookings(items);
  }, [fetchBookings, statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter(
      (b) =>
        (b.customerName || "").toLowerCase().includes(q) ||
        (b.service || "").toLowerCase().includes(q) ||
        (b.providerName || "").toLowerCase().includes(q)
    );
  }, [bookings, search]);

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      completed: "badge badge-success",
      pending: "badge badge-warning",
      accepted: "badge badge-info",
      disputed: "badge badge-danger",
      cancelled: "badge badge-default",
      rejected: "badge badge-default",
    };
    return <span className={classes[status] || "badge badge-default"}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Bookings</h1>
        <p className="page-subtitle">View and manage customer bookings</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Bookings</div>
            <div className="inv-toolbar-sub">
              {loading && bookings.length === 0 ? "Loading..." : `${filtered.length} bookings`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <select
              className="input-select"
              style={{ width: "auto" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
              <option value="disputed">Disputed</option>
            </select>
            <div className="inv-search-wrap">
              <input
                className="inv-search"
                placeholder="Search bookings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted">
                  {loading ? "Loading bookings..." : "No bookings found."}
                </td>
              </tr>
            ) : (
              filtered.map((booking) => (
                <tr key={booking.id}>
                  <td className="fw-medium">{booking.id}</td>
                  <td>{booking.customerName || "—"}</td>
                  <td>{booking.providerName || "—"}</td>
                  <td>{booking.service || "—"}</td>
                  <td>{booking.amount != null ? `TZS ${booking.amount.toLocaleString()}` : "—"}</td>
                  <td>{getStatusBadge(booking.displayStatus || booking.status)}</td>
                  <td>{formatAdminDate(booking.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
