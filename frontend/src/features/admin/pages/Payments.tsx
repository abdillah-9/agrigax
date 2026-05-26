import { useState } from "react";

const demoPayments = [
  { id: "PAY-001", bookingId: "BK-001", customer: "Juma Mwakyoma", provider: "Kilimo Best", amount: 150000, method: "mpesa", status: "completed", date: "2026-05-20" },
  { id: "PAY-002", bookingId: "BK-002", customer: "Fatima Jabir", provider: "AgriPro", amount: 85000, method: "tigopesa", status: "pending", date: "2026-05-20" },
  { id: "PAY-003", bookingId: "BK-005", customer: "Peter Tembo", provider: "Kilimo Best", amount: 200000, method: "airtelmoney", status: "completed", date: "2026-05-18" },
  { id: "PAY-004", bookingId: "BK-006", customer: "Zainab Ally", provider: "Tanzania Livestock", amount: 1200000, method: "bank", status: "completed", date: "2026-05-18" },
  { id: "PAY-005", bookingId: "BK-007", customer: "John Banda", provider: "AgriPro", amount: 65000, method: "mpesa", status: "failed", date: "2026-05-17" },
];

export default function Payments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = demoPayments.filter(p => {
    const matchSearch = p.customer.toLowerCase().includes(search.toLowerCase()) || p.bookingId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payments & Transactions</h1>
        <p className="page-subtitle">Monitor all payment transactions</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Transactions</div>
            <div className="inv-toolbar-sub">{filtered.length} transactions</div>
          </div>
          <div className="inv-toolbar-right">
            <select className="input-select" style={{ width: "auto" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Booking</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(payment => (
              <tr key={payment.id}>
                <td className="fw-medium">{payment.id}</td>
                <td>{payment.bookingId}</td>
                <td>{payment.customer}</td>
                <td>{payment.provider}</td>
                <td>TZS {payment.amount.toLocaleString()}</td>
                <td><span className="badge badge-default">{payment.method}</span></td>
                <td>
                  {payment.status === "completed" && <span className="badge badge-success">Completed</span>}
                  {payment.status === "pending" && <span className="badge badge-warning">Pending</span>}
                  {payment.status === "failed" && <span className="badge badge-danger">Failed</span>}
                  {payment.status === "refunded" && <span className="badge badge-info">Refunded</span>}
                </td>
                <td>{payment.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
