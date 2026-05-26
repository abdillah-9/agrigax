import { useState } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  activeRole: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
}

const demoUsers: User[] = [
  { id: "USR-001", fullName: "Juma Mwakyoma", email: "juma@email.com", phone: "+255 712 345 678", activeRole: "customer", isVerified: true, isSuspended: false, createdAt: "2026-01-15" },
  { id: "USR-002", fullName: "Amina Khamis", email: "amina@email.com", phone: "+255 713 456 789", activeRole: "provider", isVerified: true, isSuspended: false, createdAt: "2026-02-20" },
  { id: "USR-003", fullName: "Hassan Petro", email: "hassan@email.com", phone: "+255 714 567 890", activeRole: "provider", isVerified: true, isSuspended: true, createdAt: "2026-03-10" },
  { id: "USR-004", fullName: "Fatima Jabir", email: "fatima@email.com", phone: "+255 715 678 901", activeRole: "customer", isVerified: false, isSuspended: false, createdAt: "2026-04-05" },
  { id: "USR-005", fullName: "Rashid Msuya", email: "rashid@email.com", phone: "+255 716 789 012", activeRole: "provider", isVerified: true, isSuspended: false, createdAt: "2026-04-15" },
  { id: "USR-006", fullName: "Zainab Ally", email: "zainab@email.com", phone: "+255 717 890 123", activeRole: "customer", isVerified: true, isSuspended: false, createdAt: "2026-04-20" },
  { id: "USR-007", fullName: "David Shayo", email: "david@email.com", phone: "+255 718 901 234", activeRole: "customer", isVerified: true, isSuspended: false, createdAt: "2026-05-01" },
  { id: "USR-008", fullName: "Grace Mushi", email: "grace@email.com", phone: "+255 719 012 345", activeRole: "customer", isVerified: false, isSuspended: true, createdAt: "2026-05-10" },
];

export default function Users() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = demoUsers.filter(u => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.activeRole === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage all platform users</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Users</div>
            <div className="inv-toolbar-sub">{filtered.length} users found</div>
          </div>
          <div className="inv-toolbar-right">
            <select className="input-select" style={{ width: "auto" }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </select>
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id}>
                <td className="fw-medium">{user.id}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td><span className="badge badge-info">{user.activeRole}</span></td>
                <td>
                  {user.isSuspended ? (
                    <span className="badge badge-danger">Suspended</span>
                  ) : user.isVerified ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-warning">Unverified</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">View</button>
                    {user.isSuspended ? (
                      <button className="inv-action-btn inv-action-btn-success">Unsuspend</button>
                    ) : (
                      <button className="inv-action-btn inv-action-btn-danger">Suspend</button>
                    )}
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
