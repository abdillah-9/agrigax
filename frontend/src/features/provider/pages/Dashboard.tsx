import { useNavigate } from "react-router-dom";
import {
  HiCurrencyDollar,
  HiClipboardList,
  HiClock,
  HiPlus,
  HiArrowRight,
  HiCollection,
  HiCalendar,
  HiChartBar,
  HiTrendingUp,
} from "react-icons/hi";
import "../styles/provider.css";

const recentBookings = [
  {
    id: "BK-001",
    customer: "Juma M.",
    initials: "JM",
    service: "Tractor Rental",
    amount: "TZS 120,000",
    status: "pending",
    date: "2026-05-20",
  },
  {
    id: "BK-002",
    customer: "Fatima J.",
    initials: "FJ",
    service: "Seeds Supply",
    amount: "TZS 85,000",
    status: "accepted",
    date: "2026-05-20",
  },
  {
    id: "BK-003",
    customer: "David S.",
    initials: "DS",
    service: "Irrigation Setup",
    amount: "TZS 320,000",
    status: "completed",
    date: "2026-05-19",
  },
  {
    id: "BK-004",
    customer: "Grace M.",
    initials: "GM",
    service: "Soil Testing",
    amount: "TZS 45,000",
    status: "pending",
    date: "2026-05-18",
  },
];

const quickLinks = [
  { icon: HiCollection, label: "My Listings", path: "/provider/listings" },
  { icon: HiCalendar, label: "Bookings", path: "/provider/bookings" },
  { icon: HiCurrencyDollar, label: "Earnings", path: "/provider/earnings" },
  { icon: HiChartBar, label: "Analytics", path: "/provider/analytics" },
];

const revenueBars = [
  { day: "Mon", value: 45, height: 45 },
  { day: "Tue", value: 62, height: 62 },
  { day: "Wed", value: 38, height: 38 },
  { day: "Thu", value: 78, height: 78 },
  { day: "Fri", value: 55, height: 55 },
  { day: "Sat", value: 90, height: 90 },
  { day: "Sun", value: 70, height: 70 },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="customer-page">
      {/* ============ WELCOME BANNER ============ */}
      <div className="dash-welcome dash-welcome-provider">
        <div className="dash-welcome-content">
          <div className="dash-welcome-text">
            <p className="dash-welcome-greeting">Provider Dashboard</p>
            <h1 className="dash-welcome-name">Welcome back, Agro Solutions</h1>
            <p className="dash-welcome-subtitle">
              Here's what's happening with your business today
            </p>
          </div>
          <button
            className="dash-action-btn dash-action-btn-primary"
            onClick={() => navigate("/provider/listings/create")}
          >
            <HiPlus className="dash-btn-icon" />
            <span>New Listing</span>
          </button>
        </div>
      </div>

      {/* ============ STATS ROW ============ */}
      <div className="dashboard-grid">
        {/* Total Earnings */}
        <div className="dash-stat-card dash-stat-green">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-green">
              <HiCurrencyDollar />
            </div>
            <div>
              <p className="dash-stat-label">Total Earnings</p>
              <p className="dash-stat-value dash-stat-value-green">TZS 3.4M</p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-up">
              <HiTrendingUp className="dash-trend-icon" /> 18% vs last month
            </span>
          </div>
        </div>

        {/* Active Listings */}
        <div className="dash-stat-card dash-stat-blue">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-blue">
              <HiClipboardList />
            </div>
            <div>
              <p className="dash-stat-label">Active Listings</p>
              <p className="dash-stat-value dash-stat-value-blue">12</p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-neutral">
              2 pending approval
            </span>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="dash-stat-card dash-stat-gold">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-gold">
              <HiClock />
            </div>
            <div>
              <p className="dash-stat-label">Pending Bookings</p>
              <p className="dash-stat-value dash-stat-value-gold">8</p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-warning">
              3 need action
            </span>
          </div>
        </div>
      </div>

      {/* ============ QUICK LINKS ============ */}
      <div className="dash-quick-actions">
        {quickLinks.map((link) => (
          <button
            key={link.path}
            className="dash-quick-link-btn"
            onClick={() => navigate(link.path)}
          >
            <link.icon className="dash-quick-link-icon" />
            <span>{link.label}</span>
          </button>
        ))}
      </div>

      {/* ============ REVENUE SPARKLINE (Provider Exclusive) ============ */}
      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Weekly Revenue</h2>
            <p className="dash-section-subtitle">Last 7 days performance</p>
          </div>
          <button
            className="dash-action-btn"
            onClick={() => navigate("/provider/analytics")}
          >
            <span>Full Analytics</span>
            <HiArrowRight className="dash-btn-icon" />
          </button>
        </div>
        <div className="provider-revenue-card">
          <div className="provider-revenue-total">
            <span className="provider-revenue-currency">TZS</span>
            <span className="provider-revenue-amount">842,000</span>
            <span className="provider-revenue-period">this week</span>
          </div>
          <div className="provider-bar-chart">
            {revenueBars.map((bar) => (
              <div key={bar.day} className="provider-bar-col">
                <div
                  className="provider-bar-fill"
                  style={{ height: `${bar.height}%` }}
                >
                  <span className="provider-bar-tooltip">TZS {bar.value}K</span>
                </div>
                <span className="provider-bar-label">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ RECENT BOOKINGS ============ */}
      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Recent Booking Requests</h2>
            <p className="dash-section-subtitle">
              {recentBookings.length} new bookings
            </p>
          </div>
          <button
            className="dash-action-btn"
            onClick={() => navigate("/provider/bookings")}
          >
            <span>View All</span>
            <HiArrowRight className="dash-btn-icon" />
          </button>
        </div>
        <div className="dash-booking-list">
          {recentBookings.map((b) => (
            <div key={b.id} className="dash-booking-card">
              <div
                className={`dash-booking-avatar dash-booking-avatar-${b.status}`}
              >
                {b.initials}
              </div>
              <div className="dash-booking-info">
                <h4 className="dash-booking-service">{b.customer}</h4>
                <p className="dash-booking-meta">
                  {b.service} · {b.date}
                </p>
              </div>
              <div className="dash-booking-right">
                <p className="dash-booking-price">{b.amount}</p>
                <span
                  className={`badge badge-${
                    b.status === "completed"
                      ? "success"
                      : b.status === "pending"
                      ? "warning"
                      : "info"
                  }`}
                >
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
