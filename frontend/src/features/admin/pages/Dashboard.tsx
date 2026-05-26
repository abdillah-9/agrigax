import { useState } from "react";

const stats = [
  { label: "Total Users", value: "2,847", change: "+12%", positive: true, icon: "👥" },
  { label: "Total Providers", value: "486", change: "+8%", positive: true, icon: "🏪" },
  { label: "Active Listings", value: "1,253", change: "+15%", positive: true, icon: "📋" },
  { label: "Revenue (Monthly)", value: "TZS 45.2M", change: "+22%", positive: true, icon: "💰" },
  { label: "Pending Approvals", value: "23", change: "-5%", positive: false, icon: "⏳" },
  { label: "Active Disputes", value: "7", change: "+2", positive: false, icon: "⚠️" },
];

const recentUsers = [
  { id: "1", name: "Juma M.", email: "juma@email.com", role: "Customer", date: "2026-05-20" },
  { id: "2", name: "Amina K.", email: "amina@email.com", role: "Provider", date: "2026-05-20" },
  { id: "3", name: "Hassan P.", email: "hassan@email.com", role: "Provider", date: "2026-05-19" },
  { id: "4", name: "Fatima J.", email: "fatima@email.com", role: "Customer", date: "2026-05-19" },
  { id: "5", name: "Rashid M.", email: "rashid@email.com", role: "Provider", date: "2026-05-18" },
];

const recentBookings = [
  { id: "BK-001", customer: "Juma M.", provider: "Kilimo Best", service: "Tractor Rent", amount: "TZS 150,000", status: "completed" },
  { id: "BK-002", customer: "Fatima J.", provider: "AgriPro", service: "Seeds Supply", amount: "TZS 85,000", status: "pending" },
  { id: "BK-003", customer: "David S.", provider: "Farm Help", service: "Irrigation Setup", amount: "TZS 320,000", status: "in-progress" },
  { id: "BK-004", customer: "Grace M.", provider: "Green Tech", service: "Soil Testing", amount: "TZS 45,000", status: "disputed" },
  { id: "BK-005", customer: "Peter T.", provider: "Kilimo Best", service: "Harvesting", amount: "TZS 200,000", status: "completed" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "bookings">("overview");

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      completed: "badge badge-success",
      pending: "badge badge-warning",
      "in-progress": "badge badge-info",
      disputed: "badge badge-danger",
    };
    return <span className={classes[status] || "badge badge-default"}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
              <span className={`stat-change ${stat.positive ? "stat-change-positive" : "stat-change-negative"}`}>
                {stat.change} from last month
              </span>
            </div>
            <span className="stat-icon">{stat.icon}</span>
          </div>
        ))}
      </div>

      <div className="tab-nav">
        {["overview", "users", "bookings"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "tab-btn-active" : ""}`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== "bookings" && (
        <div className="table-container">
          <div className="inv-toolbar">
            <div className="inv-toolbar-left">
              <div className="inv-toolbar-title">Recent Registrations</div>
              <div className="inv-toolbar-sub">Latest 5 user signups</div>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="fw-medium">{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className="badge badge-info">{user.role}</span></td>
                  <td>{user.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab !== "users" && (
        <div className="table-container">
          <div className="inv-toolbar">
            <div className="inv-toolbar-left">
              <div className="inv-toolbar-title">Recent Bookings</div>
              <div className="inv-toolbar-sub">Latest booking activity</div>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Provider</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="fw-medium">{booking.id}</td>
                  <td>{booking.customer}</td>
                  <td>{booking.provider}</td>
                  <td>{booking.service}</td>
                  <td>{booking.amount}</td>
                  <td>{getStatusBadge(booking.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
