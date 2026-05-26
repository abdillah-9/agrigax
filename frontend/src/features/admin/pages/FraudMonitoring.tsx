import { useState } from "react";

const demoAlerts = [
  { id: "FRD-001", user: "Grace Mushi", type: "Multiple Accounts", risk: "high", description: "3 accounts from same IP address", detected: "2026-05-20", status: "investigating" },
  { id: "FRD-002", user: "Hassan Petro", type: "Suspicious Payments", risk: "medium", description: "5 failed payment attempts in 10 minutes", detected: "2026-05-19", status: "pending" },
  { id: "FRD-003", user: "Unknown User", type: "Fake Listings", risk: "high", description: "Multiple duplicate listings detected", detected: "2026-05-18", status: "resolved" },
  { id: "FRD-004", user: "John Banda", type: "Chargeback Pattern", risk: "low", description: "2 chargebacks in 30 days", detected: "2026-05-17", status: "monitoring" },
];

export default function FraudMonitoring() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Fraud Monitoring</h1>
        <p className="page-subtitle">Detect and prevent fraudulent activities</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <p className="stat-label">Active Alerts</p>
            <p className="stat-value">3</p>
            <span className="stat-change stat-change-negative">High priority</span>
          </div>
          <span className="stat-icon">🚨</span>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Blocked Users (May)</p>
            <p className="stat-value">12</p>
            <span className="stat-change stat-change-positive">-3 from April</span>
          </div>
          <span className="stat-icon">🛡️</span>
        </div>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Fraud Alerts</div>
            <div className="inv-toolbar-sub">{demoAlerts.length} alerts</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search alerts..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>User</th>
              <th>Type</th>
              <th>Risk Level</th>
              <th>Description</th>
              <th>Detected</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoAlerts.map(alert => (
              <tr key={alert.id}>
                <td className="fw-medium">{alert.id}</td>
                <td>{alert.user}</td>
                <td><span className="badge badge-danger">{alert.type}</span></td>
                <td>
                  {alert.risk === "high" && <span className="badge badge-danger">High</span>}
                  {alert.risk === "medium" && <span className="badge badge-warning">Medium</span>}
                  {alert.risk === "low" && <span className="badge badge-info">Low</span>}
                </td>
                <td className="text-muted">{alert.description}</td>
                <td>{alert.detected}</td>
                <td>
                  {alert.status === "investigating" && <span className="badge badge-warning">Investigating</span>}
                  {alert.status === "pending" && <span className="badge badge-default">Pending</span>}
                  {alert.status === "resolved" && <span className="badge badge-success">Resolved</span>}
                  {alert.status === "monitoring" && <span className="badge badge-info">Monitoring</span>}
                </td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">Investigate</button>
                    <button className="inv-action-btn inv-action-btn-danger">Block User</button>
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
