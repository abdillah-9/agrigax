import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { formatAdminDate } from "../../../api/adminHelpers";
import type { AdminUser } from "../../../types/api.types";

export default function SuspendedUsers() {
  const { fetchUsers, reinstateUser, loading, error } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const { items } = await fetchUsers({ page: "1", limit: "100", suspended: "true" });
    setUsers(items);
  }, [fetchUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  async function handleReinstate(id: string) {
    setActionId(id);
    const ok = await reinstateUser(id);
    setActionId(null);
    if (ok) await loadUsers();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Suspended Accounts</h1>
        <p className="page-subtitle">Review and manage suspended user accounts</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Suspended Users</div>
            <div className="inv-toolbar-sub">
              {loading && users.length === 0 ? "Loading..." : `${filtered.length} suspended accounts`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input
                className="inv-search"
                placeholder="Search suspended users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted">
                  {loading ? "Loading..." : "No suspended users found."}
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id}>
                  <td className="fw-medium">{user.fullName || user.username}</td>
                  <td>{user.email || "—"}</td>
                  <td><span className="badge badge-info">{user.role}</span></td>
                  <td>{user.phone}</td>
                  <td>{formatAdminDate(user.createdAt)}</td>
                  <td>
                    <button
                      className="inv-action-btn inv-action-btn-success"
                      disabled={actionId === user.id}
                      onClick={() => handleReinstate(user.id)}
                    >
                      Reinstate
                    </button>
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
