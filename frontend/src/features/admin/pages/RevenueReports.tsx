import { useState } from "react";

const demoRevenue = [
  { month: "January 2026", bookings: 320, revenue: 8500000, commission: 850000, refunds: 120000, net: 8380000 },
  { month: "February 2026", bookings: 345, revenue: 9200000, commission: 920000, refunds: 85000, net: 9115000 },
  { month: "March 2026", bookings: 410, revenue: 11200000, commission: 1120000, refunds: 200000, net: 11000000 },
  { month: "April 2026", bookings: 480, revenue: 13500000, commission: 1350000, refunds: 150000, net: 13350000 },
  { month: "May 2026", bookings: 520, revenue: 14800000, commission: 1480000, refunds: 180000, net: 14620000 },
];

export default function RevenueReports() {
  const [search, setSearch] = useState("");

  const totalRevenue = demoRevenue.reduce((sum, r) => sum + r.revenue, 0);
  const totalNet = demoRevenue.reduce((sum, r) => sum + r.net, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Revenue Reports</h1>
        <p className="page-subtitle">Track platform revenue and earnings</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <p className="stat-label">Total Revenue (2026)</p>
            <p className="stat-value">TZS {(totalRevenue / 1000000).toFixed(1)}M</p>
          </div>
          <span className="stat-icon">💰</span>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Net Revenue</p>
            <p className="stat-value">TZS {(totalNet / 1000000).toFixed(1)}M</p>
          </div>
          <span className="stat-icon">📊</span>
        </div>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Monthly Breakdown</div>
            <div className="inv-toolbar-sub">{demoRevenue.length} months</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search month..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Bookings</th>
              <th>Revenue</th>
              <th>Commission</th>
              <th>Refunds</th>
              <th>Net Revenue</th>
            </tr>
          </thead>
          <tbody>
            {demoRevenue.filter(r => r.month.toLowerCase().includes(search.toLowerCase())).map(row => (
              <tr key={row.month}>
                <td className="fw-medium">{row.month}</td>
                <td>{row.bookings}</td>
                <td>TZS {row.revenue.toLocaleString()}</td>
                <td>TZS {row.commission.toLocaleString()}</td>
                <td className="stat-change-negative">- TZS {row.refunds.toLocaleString()}</td>
                <td className="fw-semibold stat-change-positive">TZS {row.net.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
