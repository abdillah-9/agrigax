import { useState } from "react";

const demoSuspended = [
  { id: "USR-003", fullName: "Hassan Petro", email: "hassan@email.com", role: "provider", reason: "Multiple policy violations", suspendedDate: "2026-05-01", reports: 12 },
  { id: "USR-008", fullName: "Grace Mushi", email: "grace@email.com", role: "customer", reason: "Fraudulent activity", suspendedDate: "2026-05-10", reports: 5 },
  { id: "USR-012", fullName: "Michael John", email: "michael@email.com", role: "provider", reason: "Fake listings", suspendedDate: "2026-05-12", reports: 8 },
  { id: "USR-015", fullName: "Sarah Mwanga", email: "sarah@email.com", role: "customer", reason: "Payment disputes", suspendedDate: "2026-05-15", reports: 3 },
];

export default function SuspendedUsers() {
  const [search, setSearch] = useState("");

  const filtered = demoSuspended.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Suspended Accounts</h1>
        <p className="page-subtitle">Review and manage suspended user accounts</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Suspended Users</div>
            <div className="inv-toolbar-sub">{filtered.length} suspended accounts</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search suspended users..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Suspension Reason</th>
              <th>Suspended Date</th>
              <th>Reports</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id}>
                <td className="fw-medium">{user.fullName}</td>
                <td>{user.email}</td>
                <td><span className="badge badge-info">{user.role}</span></td>
                <td className="text-muted">{user.reason}</td>
                <td>{user.suspendedDate}</td>
                <td><span className="badge badge-danger">{user.reports} reports</span></td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-success">Reinstate</button>
                    <button className="inv-action-btn inv-action-btn-danger">Permanent Ban</button>
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
