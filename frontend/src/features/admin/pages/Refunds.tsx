import { useState } from "react";

const demoRefunds = [
  { id: "REF-001", paymentId: "PAY-010", customer: "David Shayo", provider: "Farm Help", amount: 120000, reason: "Service cancelled by provider", status: "approved", requestDate: "2026-05-18", processedDate: "2026-05-19" },
  { id: "REF-002", paymentId: "PAY-005", customer: "John Banda", provider: "AgriPro", amount: 65000, reason: "Payment failed but deducted", status: "pending", requestDate: "2026-05-19", processedDate: "-" },
  { id: "REF-003", paymentId: "PAY-012", customer: "Grace Mushi", provider: "Green Tech", amount: 45000, reason: "Service quality dispute", status: "processing", requestDate: "2026-05-19", processedDate: "-" },
  { id: "REF-004", paymentId: "PAY-008", customer: "Peter Tembo", provider: "Kilimo Best", amount: 85000, reason: "Duplicate charge", status: "approved", requestDate: "2026-05-16", processedDate: "2026-05-17" },
];

export default function Refunds() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = demoRefunds.filter(r => {
    const matchSearch = r.customer.toLowerCase().includes(search.toLowerCase()) || r.reason.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Refunds</h1>
        <p className="page-subtitle">Process and manage refund requests</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Refund Requests</div>
            <div className="inv-toolbar-sub">{filtered.length} requests</div>
          </div>
          <div className="inv-toolbar-right">
            <select className="input-select" style={{ width: "auto" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search refunds..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Refund ID</th>
              <th>Payment</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(refund => (
              <tr key={refund.id}>
                <td className="fw-medium">{refund.id}</td>
                <td>{refund.paymentId}</td>
                <td>{refund.customer}</td>
                <td>TZS {refund.amount.toLocaleString()}</td>
                <td className="text-muted">{refund.reason}</td>
                <td>
                  {refund.status === "pending" && <span className="badge badge-warning">Pending</span>}
                  {refund.status === "processing" && <span className="badge badge-info">Processing</span>}
                  {refund.status === "approved" && <span className="badge badge-success">Approved</span>}
                  {refund.status === "rejected" && <span className="badge badge-danger">Rejected</span>}
                </td>
                <td>{refund.requestDate}</td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-success">Approve</button>
                    <button className="inv-action-btn inv-action-btn-danger">Reject</button>
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
