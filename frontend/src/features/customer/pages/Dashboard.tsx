import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiSearch, HiClipboardList, HiHeart, HiArrowRight, HiCalendar, HiChat } from "react-icons/hi";
import { useAuthContext } from "../../../contexts/AuthContext";
import { useBookings } from "../../../hooks/useBookings";
import { useFavorites } from "../../../hooks/useFavorites";
import {
  bookingCardInitials,
  customerDashboardStats,
  dashboardBadgeClass,
  sortBookingsNewest,
} from "../../../api/dashboardHelpers";
import {
  clearBookingLookupCache,
  enrichBookings,
  formatBookingAmount,
  formatBookingDate,
} from "../../../api/bookingHelpers";
import { displayName } from "../../../utils/userDisplay";
import type { EnrichedBooking } from "../../../types/api.types";
import "../styles/customer.css";

const quickLinks = [
  { icon: HiSearch, label: "Browse Listings", path: "/app/listings" },
  { icon: HiCalendar, label: "My Bookings", path: "/app/bookings" },
  { icon: HiHeart, label: "Favorites", path: "/app/favorites" },
  { icon: HiChat, label: "Messages", path: "/app/messages" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { fetchMyBookings, loading: bookingsLoading, error: bookingsError } = useBookings();
  const { fetchFavorites, error: favoritesError } = useFavorites();

  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    clearBookingLookupCache();

    const [bookingRows, favorites] = await Promise.all([
      fetchMyBookings(),
      fetchFavorites(),
    ]);

    setBookings(await enrichBookings(bookingRows));
    setFavoriteCount(favorites.length);
    setLoading(false);
  }, [fetchMyBookings, fetchFavorites]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(
    () => customerDashboardStats(bookings, favoriteCount),
    [bookings, favoriteCount]
  );

  const recentBookings = useMemo(
    () => sortBookingsNewest(bookings).slice(0, 5),
    [bookings]
  );

  const error = bookingsError || favoritesError;
  const name = displayName(user);

  return (
    <main className="customer-page">
      <div className="dash-welcome">
        <div className="dash-welcome-content">
          <div className="dash-welcome-text">
            <p className="dash-welcome-greeting">Customer Dashboard</p>
            <h1 className="dash-welcome-name">Welcome back, {name}</h1>
            <p className="dash-welcome-subtitle">Discover agricultural services near you</p>
          </div>
          <button
            className="dash-action-btn dash-action-btn-primary"
            onClick={() => navigate("/app/listings")}
          >
            <HiSearch className="dash-btn-icon" />
            <span>Browse Listings</span>
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
              <HiClipboardList />
            </div>
            <div>
              <p className="dash-stat-label">Active Bookings</p>
              <p className="dash-stat-value dash-stat-value-green">
                {loading || bookingsLoading ? "—" : stats.activeBookings}
              </p>
            </div>
          </div>
        </div>
        <div className="dash-stat-card dash-stat-blue">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-blue">
              <HiHeart />
            </div>
            <div>
              <p className="dash-stat-label">Saved Listings</p>
              <p className="dash-stat-value dash-stat-value-blue">
                {loading ? "—" : stats.favoriteCount}
              </p>
            </div>
          </div>
        </div>
        <div className="dash-stat-card dash-stat-gold">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-gold">
              <HiCalendar />
            </div>
            <div>
              <p className="dash-stat-label">Total Bookings</p>
              <p className="dash-stat-value dash-stat-value-gold">
                {loading || bookingsLoading ? "—" : bookings.length}
              </p>
            </div>
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
            <h2 className="dash-section-title">Recent Bookings</h2>
            <p className="dash-section-subtitle">Your latest service bookings</p>
          </div>
          <button className="dash-action-btn" onClick={() => navigate("/app/bookings")}>
            <span>View All</span>
            <HiArrowRight className="dash-btn-icon" />
          </button>
        </div>
        <div className="dash-booking-list">
          {loading && recentBookings.length === 0 ? (
            <p className="dash-section-subtitle">Loading bookings...</p>
          ) : recentBookings.length === 0 ? (
            <p className="dash-section-subtitle">No bookings yet. Browse listings to get started.</p>
          ) : (
            recentBookings.map((b) => (
              <div key={b.id} className="dash-booking-card">
                <div className={`dash-booking-avatar dash-booking-avatar-${b.status}`}>
                  {bookingCardInitials(b.serviceTitle)}
                </div>
                <div className="dash-booking-info">
                  <h4 className="dash-booking-service">{b.serviceTitle}</h4>
                  <p className="dash-booking-meta">
                    {b.providerName} · {formatBookingDate(b.scheduledAt)}
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
