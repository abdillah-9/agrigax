import { useState } from "react";

const demoSystemLogs = [
  { id: "SYS-001", level: "ERROR", service: "Payment Gateway", message: "M-Pesa API timeout after 30s", timestamp: "2026-05-20 14:35:00" },
  { id: "SYS-002", level: "WARN", service: "Notification Service", message: "Push notification queue exceeding 80% capacity", timestamp: "2026-05-20 14:00:00" },
  { id: "SYS-003", level: "INFO", service: "Database", message: "Daily backup completed successfully - 2.4GB", timestamp: "2026-05-20 03:00:00" },
  { id: "SYS-004", level: "ERROR", service: "Image Upload", message: "S3 bucket permission denied for user uploads", timestamp: "2026-05-19 16:20:00" },
  { id: "SYS-005", level: "INFO", service: "Cache", message: "Redis cache cleared - memory freed: 512MB", timestamp: "2026-05-19 12:00:00" },
  { id: "SYS-006", level: "WARN", service: "Email Service", message: "SMTP rate limit approaching (90% used)", timestamp: "2026-05-19 10:45:00" },
];

export default function SystemLogs() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const filtered = demoSystemLogs.filter(log => {
    const matchSearch = log.message.toLowerCase().includes(search.toLowerCase()) || log.service.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "all" || log.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Logs</h1>
        <p className="page-subtitle">Monitor system-level events and errors</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">System Events</div>
            <div className="inv-toolbar-sub">{filtered.length} log entries</div>
          </div>
          <div className="inv-toolbar-right">
            <select className="input-select" style={{ width: "auto" }} value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              <option value="all">All Levels</option>
              <option value="ERROR">Error</option>
              <option value="WARN">Warning</option>
              <option value="INFO">Info</option>
            </select>
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Service</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id}>
                <td className="text-sm">{log.timestamp}</td>
                <td>
                  {log.level === "ERROR" && <span className="badge badge-danger">ERROR</span>}
                  {log.level === "WARN" && <span className="badge badge-warning">WARN</span>}
                  {log.level === "INFO" && <span className="badge badge-info">INFO</span>}
                </td>
                <td className="fw-medium">{log.service}</td>
                <td className="text-muted">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
