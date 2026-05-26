import { useState } from "react";

const demoCommissions = [
  { id: "COM-001", provider: "Kilimo Best Supplies", totalBookings: 45, revenue: 4500000, commissionRate: 10, commissionEarned: 450000, status: "paid", period: "May 2026" },
  { id: "COM-002", provider: "AgriPro Solutions", totalBookings: 32, revenue: 2800000, commissionRate: 10, commissionEarned: 280000, status: "pending", period: "May 2026" },
  { id: "COM-003", provider: "Farm Help Services", totalBookings: 28, revenue: 2100000, commissionRate: 8, commissionEarned: 168000, status: "paid", period: "May 2026" },
  { id: "COM-004", provider: "Green Tech Agri", totalBookings: 15, revenue: 1800000, commissionRate: 10, commissionEarned: 180000, status: "pending", period: "May 2026" },
  { id: "COM-005", provider: "Tanzania Livestock Co", totalBookings: 38, revenue: 8500000, commissionRate: 12, commissionEarned: 1020000, status: "paid", period: "May 2026" },
];

export default function Commissions() {
  const [search, setSearch] = useState("");

  const filtered = demoCommissions.filter(c =>
    c.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Commissions</h1>
        <p className="page-subtitle">Track platform commission earnings</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <p className="stat-label">Total Commission (May)</p>
            <p className="stat-value">TZS 2.1M</p>
            <span className="stat-change stat-change-positive">+18% from April</span>
          </div>
          <span className="stat-icon">💸</span>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Pending Payouts</p>
            <p className="stat-value">TZS 628K</p>
            <span className="stat-change">4 providers</span>
          </div>
          <span className="stat-icon">⏳</span>
        </div>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Commission Details</div>
            <div className="inv-toolbar-sub">{filtered.length} providers</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search providers..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Bookings</th>
              <th>Revenue</th>
              <th>Rate</th>
              <th>Commission</th>
              <th>Status</th>
              <th>Period</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(com => (
              <tr key={com.id}>
                <td className="fw-medium">{com.provider}</td>
                <td>{com.totalBookings}</td>
                <td>TZS {com.revenue.toLocaleString()}</td>
                <td>{com.commissionRate}%</td>
                <td>TZS {com.commissionEarned.toLocaleString()}</td>
                <td>
                  {com.status === "paid" ? (
                    <span className="badge badge-success">Paid</span>
                  ) : (
                    <span className="badge badge-warning">Pending</span>
                  )}
                </td>
                <td>{com.period}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
