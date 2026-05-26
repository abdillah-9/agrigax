import { useState } from "react";

const demoDisputes = [
  { id: "DSP-001", bookingId: "BK-004", customer: "Grace Mushi", provider: "Green Tech Agri", issue: "Service not delivered as described", amount: 45000, status: "open", filedDate: "2026-05-19" },
  { id: "DSP-002", bookingId: "BK-010", customer: "Peter Tembo", provider: "Farm Help Services", issue: "Delayed service delivery", amount: 120000, status: "under-review", filedDate: "2026-05-17" },
  { id: "DSP-003", bookingId: "BK-015", customer: "John Banda", provider: "Kilimo Best", issue: "Billing discrepancy", amount: 85000, status: "resolved", filedDate: "2026-05-15" },
  { id: "DSP-004", bookingId: "BK-018", customer: "Zainab Ally", provider: "AgriPro Solutions", issue: "Wrong product delivered", amount: 35000, status: "open", filedDate: "2026-05-18" },
];

export default function BookingDisputes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");

  const filtered = demoDisputes.filter(d => {
    const matchSearch = d.customer.toLowerCase().includes(search.toLowerCase()) || d.issue.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Booking Disputes</h1>
        <p className="page-subtitle">Resolve disputes between customers and providers</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Disputes</div>
            <div className="inv-toolbar-sub">{filtered.length} active disputes</div>
          </div>
          <div className="inv-toolbar-right">
            <select className="input-select" style={{ width: "auto" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="open">Open</option>
              <option value="under-review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="all">All</option>
            </select>
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search disputes..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Dispute ID</th>
              <th>Booking</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Issue</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(dispute => (
              <tr key={dispute.id}>
                <td className="fw-medium">{dispute.id}</td>
                <td>{dispute.bookingId}</td>
                <td>{dispute.customer}</td>
                <td>{dispute.provider}</td>
                <td className="text-muted">{dispute.issue}</td>
                <td>TZS {dispute.amount.toLocaleString()}</td>
                <td>
                  {dispute.status === "open" && <span className="badge badge-danger">Open</span>}
                  {dispute.status === "under-review" && <span className="badge badge-warning">Under Review</span>}
                  {dispute.status === "resolved" && <span className="badge badge-success">Resolved</span>}
                </td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">Review</button>
                    <button className="inv-action-btn inv-action-btn-success">Resolve</button>
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
