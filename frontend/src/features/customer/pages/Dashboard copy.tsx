import { useNavigate } from "react-router-dom";

const recentBookings = [
  { id: "BK-001", service: "Tractor Rental", provider: "Kilimo Best", price: "TZS 120,000", status: "completed", date: "2026-05-20" },
  { id: "BK-002", service: "Irrigation Setup", provider: "Green Tech", price: "TZS 350,000", status: "pending", date: "2026-05-19" },
  { id: "BK-003", service: "Seeds Supply", provider: "AgriPro", price: "TZS 25,000", status: "in-progress", date: "2026-05-18" },
];

const quickLinks = [
  { icon: "🔍", label: "Browse Listings", path: "/app/listings" },
  { icon: "📅", label: "My Bookings", path: "/app/bookings" },
  { icon: "❤️", label: "Favorites", path: "/app/favorites" },
  { icon: "💳", label: "Wallet", path: "/app/wallet" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="p-xl">
      {/* Welcome Banner */}
      <div className="dash-welcome mb-xl">
        <div className="dash-welcome-content flex justify-between items-center flex-wrap gap-lg">
          <div>
            <p className="dash-welcome-greeting mb-sm">Customer Dashboard</p>
            <h1 className="text-2xl fw-bold dash-welcome-name">Welcome back, Abdillah</h1>
            <p className="text-sm mt-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Discover agricultural services near you
            </p>
          </div>
          <button className="dash-action-btn primary" onClick={() => navigate("/app/listings")}>
            🔍 Browse Listings
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-grid">
        <div className="dash-stat-card green">
          <div className="flex items-center gap-md mb-md">
            <div className="dash-stat-icon-wrap" style={{ background: "rgba(75,129,91,0.1)" }}>📋</div>
            <div>
              <p className="text-xs text-muted">Active Bookings</p>
              <p className="dash-stat-value" style={{ color: "#2E7D4F" }}>12</p>
            </div>
          </div>
        </div>
        <div className="dash-stat-card blue">
          <div className="flex items-center gap-md mb-md">
            <div className="dash-stat-icon-wrap" style={{ background: "rgba(58,123,213,0.1)" }}>❤️</div>
            <div>
              <p className="text-xs text-muted">Favorite Providers</p>
              <p className="dash-stat-value" style={{ color: "#25579E" }}>8</p>
            </div>
          </div>
        </div>
        <div className="dash-stat-card gold">
          <div className="flex items-center gap-md mb-md">
            <div className="dash-stat-icon-wrap" style={{ background: "rgba(175,154,90,0.1)" }}>💳</div>
            <div>
              <p className="text-xs text-muted">Wallet Balance</p>
              <p className="dash-stat-value" style={{ color: "#8C7A48" }}>TZS 240K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="dash-quick-actions mt-xl">
        {quickLinks.map(link => (
          <button key={link.path} className="dash-action-btn" onClick={() => navigate(link.path)}>
            {link.icon} {link.label}
          </button>
        ))}
      </div>

      {/* Recent Bookings */}
      <section className="mt-xl">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="text-lg fw-bold neutral-dark">Recent Bookings</h2>
            <p className="text-xs text-muted mt-xs">Your latest service bookings</p>
          </div>
          <button className="dash-action-btn" onClick={() => navigate("/app/bookings")}>View All →</button>
        </div>
        <div className="flex flex-col gap-sm">
          {recentBookings.map(b => (
            <div key={b.id} className="dash-booking-card">
              <div className="dash-booking-avatar" style={{
                background: b.status === "completed" ? "linear-gradient(135deg, #2E7D4F, #1F5A38)" :
                            b.status === "pending" ? "linear-gradient(135deg, #D4C685, #9C8B3D)" :
                            "linear-gradient(135deg, #3A7BD5, #25579E)"
              }}>{b.service.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <h4 className="text-sm fw-semibold">{b.service}</h4>
                <p className="text-xs text-muted">{b.provider} · {b.date}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="text-sm fw-semibold">{b.price}</p>
                <span className={`badge ${b.status === "completed" ? "badge-success" : b.status === "pending" ? "badge-warning" : "badge-info"} text-xs`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
