import { useNavigate } from "react-router-dom";
import { HiSearch, HiClipboardList, HiHeart, HiArrowRight, HiCalendar } from "react-icons/hi";
import { FaWallet } from "react-icons/fa6";
import "../styles/customer.css";

const recentBookings = [
  { id: "BK-001", service: "Tractor Rental", provider: "Kilimo Best", price: "TZS 120,000", status: "completed", date: "2026-05-20" },
  { id: "BK-002", service: "Irrigation Setup", provider: "Green Tech", price: "TZS 350,000", status: "pending", date: "2026-05-19" },
  { id: "BK-003", service: "Seeds Supply", provider: "AgriPro", price: "TZS 25,000", status: "in-progress", date: "2026-05-18" },
];

const quickLinks = [
  { icon: HiSearch, label: "Browse Listings", path: "/app/listings" },
  { icon: HiCalendar, label: "My Bookings", path: "/app/bookings" },
  { icon: HiHeart, label: "Favorites", path: "/app/favorites" },
  { icon: FaWallet, label: "Wallet", path: "/app/wallet" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="customer-page">
      
      {/* Welcome Banner */}
      <div className="dash-welcome">
        <div className="dash-welcome-content">
          <div className="dash-welcome-text">
            <p className="dash-welcome-greeting">Customer Dashboard</p>
            <h1 className="dash-welcome-name">Welcome back, Abdillah</h1>
            <p className="dash-welcome-subtitle">
              Discover agricultural services near you
            </p>
          </div>
          <button className="dash-action-btn dash-action-btn-primary" onClick={() => navigate("/app/listings")}>
            <HiSearch className="dash-btn-icon" />
            <span>Browse Listings</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-grid">
        <div className="dash-stat-card dash-stat-green">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-green">
              <HiClipboardList />
            </div>
            <div>
              <p className="dash-stat-label">Active Bookings</p>
              <p className="dash-stat-value dash-stat-value-green">12</p>
            </div>
          </div>
        </div>
        <div className="dash-stat-card dash-stat-blue">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-blue">
              <HiHeart />
            </div>
            <div>
              <p className="dash-stat-label">Favorite Providers</p>
              <p className="dash-stat-value dash-stat-value-blue">8</p>
            </div>
          </div>
        </div>
        <div className="dash-stat-card dash-stat-gold">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-gold">
              <FaWallet />
            </div>
            <div>
              <p className="dash-stat-label">Wallet Balance</p>
              <p className="dash-stat-value dash-stat-value-gold">TZS 240K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="dash-quick-actions">
        {quickLinks.map(link => (
          <button key={link.path} className="dash-quick-link-btn" onClick={() => navigate(link.path)}>
            <link.icon className="dash-quick-link-icon" />
            <span>{link.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Bookings */}
      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Recent Bookings</h2>
            <p className="dash-section-subtitle">Your latest service bookings</p>
          </div>
          <button className="dash-action-btn" onClick={() => navigate("/app/bookings")}>
            <span>View All</span>
            <HiArrowRight className="dash-btn-icon" />
          </button>
        </div>
        <div className="dash-booking-list">
          {recentBookings.map(b => (
            <div key={b.id} className="dash-booking-card">
              <div className={`dash-booking-avatar dash-booking-avatar-${b.status}`}>
                {b.service.charAt(0)}
              </div>
              <div className="dash-booking-info">
                <h4 className="dash-booking-service">{b.service}</h4>
                <p className="dash-booking-meta">{b.provider} · {b.date}</p>
              </div>
              <div className="dash-booking-right">
                <p className="dash-booking-price">{b.price}</p>
                <span className={`badge badge-${b.status === "completed" ? "success" : b.status === "pending" ? "warning" : "info"}`}>
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
