import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { formatAdminDate } from "../../../api/adminHelpers";
import type { AdminUser } from "../../../types/api.types";

export default function Users() {
  const { fetchUsers, suspendUser, reinstateUser, loading, error } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const { items } = await fetchUsers({ page: "1", limit: "100" });
    setUsers(items);
  }, [fetchUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  async function handleSuspend(id: string) {
    setActionId(id);
    const ok = await suspendUser(id);
    setActionId(null);
    if (ok) await loadUsers();
  }

  async function handleReinstate(id: string) {
    setActionId(id);
    const ok = await reinstateUser(id);
    setActionId(null);
    if (ok) await loadUsers();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage all platform users</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Users</div>
            <div className="inv-toolbar-sub">
              {loading && users.length === 0 ? "Loading..." : `${filtered.length} users found`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <select
              className="input-select"
              style={{ width: "auto" }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </select>
            <div className="inv-search-wrap">
              <input
                className="inv-search"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-muted">
                  {loading ? "Loading users..." : "No users match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id}>
                  <td className="fw-medium">{user.id}</td>
                  <td>{user.fullName || user.username}</td>
                  <td>{user.email || "—"}</td>
                  <td>{user.phone}</td>
                  <td><span className="badge badge-info">{user.role}</span></td>
                  <td>
                    {user.isSuspended ? (
                      <span className="badge badge-danger">Suspended</span>
                    ) : user.isVerified ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-warning">Unverified</span>
                    )}
                  </td>
                  <td>{formatAdminDate(user.createdAt)}</td>
                  <td>
                    <div className="flex gap-sm">
                      {user.isSuspended ? (
                        <button
                          className="inv-action-btn inv-action-btn-success"
                          disabled={actionId === user.id}
                          onClick={() => handleReinstate(user.id)}
                        >
                          Unsuspend
                        </button>
                      ) : (
                        <button
                          className="inv-action-btn inv-action-btn-danger"
                          disabled={actionId === user.id || user.role === "admin"}
                          onClick={() => handleSuspend(user.id)}
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
