import { useState } from "react";

const demoRoles = [
  { id: "ROL-001", name: "Super Admin", users: 2, permissions: ["all"], description: "Full system access", createdAt: "2026-01-01" },
  { id: "ROL-002", name: "Content Manager", users: 5, permissions: ["listings", "categories", "banners", "faqs"], description: "Manage platform content", createdAt: "2026-02-15" },
  { id: "ROL-003", name: "Support Agent", users: 8, permissions: ["users", "bookings", "disputes", "reviews"], description: "Handle customer support", createdAt: "2026-03-01" },
  { id: "ROL-004", name: "Finance Admin", users: 3, permissions: ["payments", "commissions", "refunds", "reports"], description: "Manage financial operations", createdAt: "2026-03-20" },
];

export default function Roles() {
  const [search, setSearch] = useState("");

  const filtered = demoRoles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Roles & Permissions</h1>
        <p className="page-subtitle">Manage admin roles and access control</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Roles</div>
            <div className="inv-toolbar-sub">{filtered.length} roles defined</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="inv-btn-create">
              <span className="inv-btn-create-icon">+</span> Create Role
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Users</th>
              <th>Permissions</th>
              <th>Description</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(role => (
              <tr key={role.id}>
                <td className="fw-medium">{role.name}</td>
                <td>{role.users} users</td>
                <td>
                  <div className="flex gap-sm">
                    {role.permissions.map(p => (
                      <span key={p} className="badge badge-info">{p}</span>
                    ))}
                  </div>
                </td>
                <td className="text-muted">{role.description}</td>
                <td>{role.createdAt}</td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">Edit</button>
                    <button className="inv-action-btn inv-action-btn-danger">Delete</button>
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
