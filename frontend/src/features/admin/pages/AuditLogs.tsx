import { useState } from "react";

const demoLogs = [
  { id: "AUD-001", user: "Admin User", action: "Approved listing LST-001", module: "Listings", severity: "info", timestamp: "2026-05-20 14:30:00" },
  { id: "AUD-002", user: "Admin User", action: "Suspended user USR-008", module: "Users", severity: "warning", timestamp: "2026-05-20 13:15:00" },
  { id: "AUD-003", user: "Finance Admin", action: "Processed refund REF-001", module: "Payments", severity: "info", timestamp: "2026-05-20 12:00:00" },
  { id: "AUD-004", user: "Support Agent", action: "Resolved dispute DSP-003", module: "Disputes", severity: "success", timestamp: "2026-05-20 11:45:00" },
  { id: "AUD-005", user: "System", action: "Failed login attempt - juma@email.com", module: "Auth", severity: "danger", timestamp: "2026-05-20 10:30:00" },
  { id: "AUD-006", user: "Admin User", action: "Created announcement ANN-001", module: "Content", severity: "info", timestamp: "2026-05-20 09:00:00" },
];

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filtered = demoLogs.filter(log => {
    const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) || log.user.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "all" || log.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
        <p className="page-subtitle">Track all administrative actions</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Activity Logs</div>
            <div className="inv-toolbar-sub">{filtered.length} entries</div>
          </div>
          <div className="inv-toolbar-right">
            <select className="input-select" style={{ width: "auto" }} value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="all">All Severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
              <option value="success">Success</option>
            </select>
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id}>
                <td className="text-sm">{log.timestamp}</td>
                <td className="fw-medium">{log.user}</td>
                <td>{log.action}</td>
                <td><span className="badge badge-default">{log.module}</span></td>
                <td>
                  {log.severity === "info" && <span className="badge badge-info">Info</span>}
                  {log.severity === "warning" && <span className="badge badge-warning">Warning</span>}
                  {log.severity === "danger" && <span className="badge badge-danger">Danger</span>}
                  {log.severity === "success" && <span className="badge badge-success">Success</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
