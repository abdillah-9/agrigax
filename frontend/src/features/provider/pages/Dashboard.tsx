import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "react-icons/hi";
import { useAuthContext } from "../../../contexts/AuthContext";
import { useBookings } from "../../../hooks/useBookings";
import { useListings } from "../../../hooks/useListings";
import { usePayments } from "../../../hooks/usePayments";
import {
  bookingCardInitials,
  dashboardBadgeClass,
  formatCompactCurrency,
  providerDashboardStats,
  sortBookingsNewest,
  weeklyRevenueFromBookings,
} from "../../../api/dashboardHelpers";
import {
  clearBookingLookupCache,
  enrichBookings,
  formatBookingAmount,
  formatBookingDate,
} from "../../../api/bookingHelpers";
import { displayName } from "../../../utils/userDisplay";
import type { EnrichedBooking, Listing, Wallet } from "../../../types/api.types";
import "../styles/provider.css";

const quickLinks = [
  { icon: HiCollection, label: "My Listings", path: "/provider/listings" },
  { icon: HiCalendar, label: "Bookings", path: "/provider/bookings" },
  { icon: HiCurrencyDollar, label: "Earnings", path: "/provider/earnings" },
  { icon: HiChartBar, label: "Analytics", path: "/provider/analytics" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { fetchProviderBookings, loading: bookingsLoading, error: bookingsError } = useBookings();
  const { fetchMyListings, error: listingsError } = useListings();
  const { fetchWallet, error: walletError } = usePayments();

  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    clearBookingLookupCache();

    const [bookingRows, listingRows, walletData] = await Promise.all([
      fetchProviderBookings(),
      fetchMyListings(),
      fetchWallet(),
    ]);

    setBookings(await enrichBookings(bookingRows));
    setListings(listingRows);
    setWallet(walletData);
    setLoading(false);
  }, [fetchProviderBookings, fetchMyListings, fetchWallet]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(
    () => providerDashboardStats(bookings, listings, wallet),
    [bookings, listings, wallet]
  );

  const recentBookings = useMemo(
    () => sortBookingsNewest(bookings).slice(0, 5),
    [bookings]
  );

  const weeklyRevenue = useMemo(() => weeklyRevenueFromBookings(bookings), [bookings]);

  const error = bookingsError || listingsError || walletError;
  const name = displayName(user);

  return (
    <main className="customer-page">
      <div className="dash-welcome dash-welcome-provider">
        <div className="dash-welcome-content">
          <div className="dash-welcome-text">
            <p className="dash-welcome-greeting">Provider Dashboard</p>
            <h1 className="dash-welcome-name">Welcome back, {name}</h1>
            <p className="dash-welcome-subtitle">
              Here&apos;s what&apos;s happening with your business today
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

      {error && (
        <p className="dash-welcome-subtitle" style={{ color: "#b42318", padding: "0 4px" }}>
          {error}
        </p>
      )}

      <div className="dashboard-grid">
        <div className="dash-stat-card dash-stat-green">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-green">
              <HiCurrencyDollar />
            </div>
            <div>
              <p className="dash-stat-label">Wallet Balance</p>
              <p className="dash-stat-value dash-stat-value-green">
                {loading ? "—" : formatCompactCurrency(stats.walletBalance, stats.walletCurrency)}
              </p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-neutral">
              {loading
                ? "Loading..."
                : `${formatCompactCurrency(stats.completedTotal, stats.walletCurrency)} from completed bookings`}
            </span>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-blue">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-blue">
              <HiClipboardList />
            </div>
            <div>
              <p className="dash-stat-label">Active Listings</p>
              <p className="dash-stat-value dash-stat-value-blue">
                {loading ? "—" : stats.activeListings}
              </p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-neutral">
              {loading
                ? "Loading..."
                : stats.pendingApproval > 0
                  ? `${stats.pendingApproval} pending approval`
                  : `${listings.length} total listing${listings.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-gold">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-gold">
              <HiClock />
            </div>
            <div>
              <p className="dash-stat-label">Pending Bookings</p>
              <p className="dash-stat-value dash-stat-value-gold">
                {loading || bookingsLoading ? "—" : stats.pendingBookings}
              </p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-warning">
              {loading ? "Loading..." : `${bookings.length} total booking${bookings.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
      </div>

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

      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Weekly Revenue</h2>
            <p className="dash-section-subtitle">Completed bookings in the last 7 days</p>
          </div>
          <button className="dash-action-btn" onClick={() => navigate("/provider/earnings")}>
            <span>View Earnings</span>
            <HiArrowRight className="dash-btn-icon" />
          </button>
        </div>
        <div className="provider-revenue-card">
          <div className="provider-revenue-total">
            <span className="provider-revenue-currency">{stats.walletCurrency}</span>
            <span className="provider-revenue-amount">
              {loading ? "—" : weeklyRevenue.total.toLocaleString()}
            </span>
            <span className="provider-revenue-period">this week</span>
          </div>
          <div className="provider-bar-chart">
            {weeklyRevenue.bars.map((bar, index) => (
              <div key={`${bar.day}-${index}`} className="provider-bar-col">
                <div className="provider-bar-fill" style={{ height: `${bar.height}%` }}>
                  <span className="provider-bar-tooltip">
                    {bar.value > 0 ? formatCompactCurrency(bar.value, stats.walletCurrency) : "—"}
                  </span>
                </div>
                <span className="provider-bar-label">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Recent Booking Requests</h2>
            <p className="dash-section-subtitle">
              {loading ? "Loading..." : `${recentBookings.length} recent booking${recentBookings.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button className="dash-action-btn" onClick={() => navigate("/provider/bookings")}>
            <span>View All</span>
            <HiArrowRight className="dash-btn-icon" />
          </button>
        </div>
        <div className="dash-booking-list">
          {loading && recentBookings.length === 0 ? (
            <p className="dash-section-subtitle">Loading bookings...</p>
          ) : recentBookings.length === 0 ? (
            <p className="dash-section-subtitle">No booking requests yet.</p>
          ) : (
            recentBookings.map((b) => (
              <div key={b.id} className="dash-booking-card">
                <div className={`dash-booking-avatar dash-booking-avatar-${b.status}`}>
                  {bookingCardInitials(b.customerName)}
                </div>
                <div className="dash-booking-info">
                  <h4 className="dash-booking-service">{b.customerName}</h4>
                  <p className="dash-booking-meta">
                    {b.serviceTitle} · {formatBookingDate(b.scheduledAt)}
                  </p>
                </div>
                <div className="dash-booking-right">
                  <p className="dash-booking-price">{formatBookingAmount(b.price)}</p>
                  <span className={`badge badge-${dashboardBadgeClass(b.status)}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
