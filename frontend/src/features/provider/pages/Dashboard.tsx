import { useNavigate } from "react-router-dom";
import "../styles/provider.css";

const recentBookings = [
  { id: "BK-001", customer: "Juma M.", initials: "JM", service: "Tractor Rental", amount: "TZS 120,000", status: "pending", date: "2026-05-20" },
  { id: "BK-002", customer: "Fatima J.", initials: "FJ", service: "Seeds Supply", amount: "TZS 85,000", status: "accepted", date: "2026-05-20" },
  { id: "BK-003", customer: "David S.", initials: "DS", service: "Irrigation Setup", amount: "TZS 320,000", status: "completed", date: "2026-05-19" },
  { id: "BK-004", customer: "Grace M.", initials: "GM", service: "Soil Testing", amount: "TZS 45,000", status: "pending", date: "2026-05-18" },
];

const quickLinks = [
  { icon: "📋", label: "My Listings", path: "/provider/listings", primary: false },
  { icon: "📅", label: "Bookings", path: "/provider/bookings", primary: false },
  { icon: "💰", label: "Earnings", path: "/provider/earnings", primary: false },
  { icon: "📊", label: "Analytics", path: "/provider/analytics", primary: false },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return { bg: "#FAF4DD", color: "#9C8B3D", dot: "#D4C685" };
      case "accepted": return { bg: "#E3EEFB", color: "#25579E", dot: "#3A7BD5" };
      case "completed": return { bg: "#DDF3E6", color: "#1F5A38", dot: "#2E7D4F" };
      default: return { bg: "#F5F7F6", color: "#666", dot: "#999" };
    }
  };

  return (
    <main className="p-xl">
      {/* Welcome Banner */}
      <div className="dash-welcome mb-xl">
        <div className="dash-welcome-content flex justify-between items-center flex-wrap gap-lg">
          <div>
            <p className="dash-welcome-greeting mb-sm">Provider Dashboard</p>
            <h1 className="text-2xl fw-bold dash-welcome-name">Welcome back, Agro Solutions</h1>
            <p className="text-sm mt-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Here's what's happening with your business today
            </p>
          </div>
          <button
            className="dash-action-btn primary"
            onClick={() => navigate("/provider/listings/create")}
          >
            + New Listing
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="provider-stats-grid">
        <div className="dash-stat-card green">
          <div className="flex items-center gap-md mb-md">
            <div className="dash-stat-icon-wrap" style={{ background: "rgba(75,129,91,0.1)" }}>💰</div>
            <div>
              <p className="text-xs text-muted">Total Earnings</p>
              <p className="dash-stat-value" style={{ color: "#2E7D4F" }}>TZS 3.4M</p>
            </div>
          </div>
          <span className="dash-stat-trend" style={{ background: "#DDF3E6", color: "#1F5A38" }}>↑ 18% vs last month</span>
        </div>

        <div className="dash-stat-card blue">
          <div className="flex items-center gap-md mb-md">
            <div className="dash-stat-icon-wrap" style={{ background: "rgba(58,123,213,0.1)" }}>📋</div>
            <div>
              <p className="text-xs text-muted">Active Listings</p>
              <p className="dash-stat-value" style={{ color: "#25579E" }}>12</p>
            </div>
          </div>
          <span className="dash-stat-trend" style={{ background: "#E3EEFB", color: "#25579E" }}>2 pending approval</span>
        </div>

        <div className="dash-stat-card gold">
          <div className="flex items-center gap-md mb-md">
            <div className="dash-stat-icon-wrap" style={{ background: "rgba(175,154,90,0.1)" }}>⏳</div>
            <div>
              <p className="text-xs text-muted">Pending Bookings</p>
              <p className="dash-stat-value" style={{ color: "#8C7A48" }}>8</p>
            </div>
          </div>
          <span className="dash-stat-trend" style={{ background: "#FAF4DD", color: "#9C8B3D" }}>3 need action</span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="dash-quick-actions mt-xl">
        {quickLinks.map(link => (
          <button
            key={link.path}
            className={`dash-action-btn ${link.primary ? "primary" : ""}`}
            onClick={() => navigate(link.path)}
          >
            {link.icon} {link.label}
          </button>
        ))}
      </div>

      {/* Recent Bookings */}
      <section className="mt-xl">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="text-lg fw-bold neutral-dark">Recent Booking Requests</h2>
            <p className="text-xs text-muted mt-xs">{recentBookings.length} new bookings</p>
          </div>
          <button className="dash-action-btn" onClick={() => navigate("/provider/bookings")}>
            View All →
          </button>
        </div>

        <div className="flex flex-col gap-sm">
          {recentBookings.map(booking => {
            const status = getStatusStyle(booking.status);
            return (
              <div key={booking.id} className="dash-booking-card">
                <div className="dash-booking-avatar" style={{
                  background: `linear-gradient(135deg, ${status.color}, ${status.dot})`
                }}>
                  {booking.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm fw-semibold">{booking.customer}</h4>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "4px 10px",
                      borderRadius: 20, background: status.bg, color: status.color
                    }}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-xs">{booking.service}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p className="text-sm fw-semibold">{booking.amount}</p>
                  <p className="text-xs text-muted mt-xs">{booking.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
