import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../contexts/AuthContext";
import { useAdmin } from "../../../hooks/useAdmin";
import { formatAdminDate } from "../../../api/adminHelpers";
import { displayName } from "../../../utils/userDisplay";
import type { AdminDashboardStats, AdminUser } from "../../../types/api.types";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { fetchDashboard, fetchUsers, loading, error } = useAdmin();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);

  const loadDashboard = useCallback(async () => {
    const [dashboard, usersResult] = await Promise.all([
      fetchDashboard(),
      fetchUsers({ page: "1", limit: "5" }),
    ]);

    if (dashboard) setStats(dashboard);
    setRecentUsers(usersResult.items);
  }, [fetchDashboard, fetchUsers]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "Total Users", value: stats.users.toLocaleString(), icon: "👥", path: "/admin/users" },
      { label: "Active Listings", value: stats.listings.toLocaleString(), icon: "📋", path: "/admin/listings" },
      { label: "Total Bookings", value: stats.bookings.toLocaleString(), icon: "📅", path: null },
      { label: "Categories", value: stats.categories.toLocaleString(), icon: "🏷️", path: "/admin/categories" },
      { label: "Pending Approvals", value: stats.pendingListings.toLocaleString(), icon: "⏳", path: "/admin/listings" },
      { label: "Open Disputes", value: stats.openDisputes.toLocaleString(), icon: "⚠️", path: "/admin/booking-disputes" },
    ];
  }, [stats]);

  const name = displayName(user);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, {name}. {loading && !stats ? "Loading platform overview..." : "Here's what's happening today."}
        </p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="stats-grid">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="stat-card"
            style={stat.path ? { cursor: "pointer" } : undefined}
            onClick={() => stat.path && navigate(stat.path)}
          >
            <div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{loading && !stats ? "—" : stat.value}</p>
              {stat.label === "Pending Approvals" && stats && stats.pendingListings > 0 && (
                <span className="stat-change stat-change-negative">Needs review</span>
              )}
              {stat.label === "Open Disputes" && stats && stats.openDisputes > 0 && (
                <span className="stat-change stat-change-negative">Action required</span>
              )}
            </div>
            <span className="stat-icon">{stat.icon}</span>
          </div>
        ))}
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Recent Registrations</div>
            <div className="inv-toolbar-sub">Latest user signups</div>
          </div>
          <div className="inv-toolbar-right">
            <button className="inv-action-btn inv-action-btn-primary" onClick={() => navigate("/admin/users")}>
              View All Users
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted">
                  {loading ? "Loading users..." : "No users found."}
                </td>
              </tr>
            ) : (
              recentUsers.map((u) => (
                <tr key={u.id}>
                  <td className="fw-medium">{u.fullName || u.username}</td>
                  <td>{u.email || "—"}</td>
                  <td><span className="badge badge-info">{u.role}</span></td>
                  <td>
                    {u.isSuspended ? (
                      <span className="badge badge-danger">Suspended</span>
                    ) : u.isVerified ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-warning">Unverified</span>
                    )}
                  </td>
                  <td>{formatAdminDate(u.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {stats && (
        <div className="table-container" style={{ marginTop: "24px" }}>
          <div className="inv-toolbar">
            <div className="inv-toolbar-left">
              <div className="inv-toolbar-title">Platform Summary</div>
              <div className="inv-toolbar-sub">V1 admin metrics from live data</div>
            </div>
          </div>
          <table className="data-table">
            <tbody>
              <tr>
                <td className="fw-medium">Total Reviews</td>
                <td>{stats.reviews.toLocaleString()}</td>
                <td>
                  <button className="inv-action-btn inv-action-btn-primary" onClick={() => navigate("/admin/reviews")}>
                    Manage Reviews
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
