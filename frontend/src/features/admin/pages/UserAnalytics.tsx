import { useState } from "react";

const demoUserAnalytics = [
  { month: "January", newCustomers: 145, newProviders: 32, activeCustomers: 890, activeProviders: 210, churnRate: "2.1%" },
  { month: "February", newCustomers: 168, newProviders: 38, activeCustomers: 1020, activeProviders: 240, churnRate: "1.8%" },
  { month: "March", newCustomers: 195, newProviders: 45, activeCustomers: 1150, activeProviders: 275, churnRate: "1.5%" },
  { month: "April", newCustomers: 220, newProviders: 52, activeCustomers: 1310, activeProviders: 318, churnRate: "1.3%" },
  { month: "May", newCustomers: 245, newProviders: 58, activeCustomers: 1500, activeProviders: 368, churnRate: "1.1%" },
];

export default function UserAnalytics() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Analytics</h1>
        <p className="page-subtitle">User growth and engagement metrics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <p className="stat-label">Total Users</p>
            <p className="stat-value">1,868</p>
            <span className="stat-change stat-change-positive">+18% growth</span>
          </div>
          <span className="stat-icon">👥</span>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Active Providers</p>
            <p className="stat-value">368</p>
            <span className="stat-change stat-change-positive">+15% this month</span>
          </div>
          <span className="stat-icon">🏪</span>
        </div>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Monthly Growth</div>
            <div className="inv-toolbar-sub">{demoUserAnalytics.length} months</div>
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
              <th>New Customers</th>
              <th>New Providers</th>
              <th>Active Customers</th>
              <th>Active Providers</th>
              <th>Churn Rate</th>
            </tr>
          </thead>
          <tbody>
            {demoUserAnalytics.filter(r => r.month.toLowerCase().includes(search.toLowerCase())).map(row => (
              <tr key={row.month}>
                <td className="fw-medium">{row.month}</td>
                <td><span className="stat-change-positive">+{row.newCustomers}</span></td>
                <td><span className="stat-change-positive">+{row.newProviders}</span></td>
                <td>{row.activeCustomers}</td>
                <td>{row.activeProviders}</td>
                <td><span className="badge badge-success">{row.churnRate}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
