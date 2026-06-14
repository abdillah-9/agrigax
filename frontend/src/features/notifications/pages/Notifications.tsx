import { useCallback, useEffect, useMemo, useState } from "react";
import { useNotifications } from "../../../hooks/useNotifications";
import {
  formatRelativeTime,
  notificationStats,
  notificationUiType,
} from "../../../api/notificationHelpers";
import type { Notification } from "../../../types/api.types";
import "../styles/notifications.css";

export default function Notifications() {
  const { fetchNotifications, markRead, markAllRead, loading, error } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");

  const loadNotifications = useCallback(async () => {
    const rows = await fetchNotifications();
    setNotifications(rows);
  }, [fetchNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const { unreadCount, readCount, total } = useMemo(
    () => notificationStats(notifications),
    [notifications]
  );

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "unread") return !n.isRead;
      if (filter === "read") return n.isRead;
      return true;
    });
  }, [notifications, filter]);

  async function handleMarkRead(id: string) {
    const ok = await markRead(id);
    if (ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  }

  async function handleMarkAllRead() {
    const ok = await markAllRead();
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  }

  const getTypeStyles = (type: Notification["type"]) => {
    const uiType = notificationUiType(type);
    switch (uiType) {
      case "success":
        return { icon: "✓", iconClass: "notification-icon-success", color: "#1F5A38" };
      case "warning":
        return { icon: "!", iconClass: "notification-icon-warning", color: "#9C8B3D" };
      case "info":
      default:
        return { icon: "i", iconClass: "notification-icon-info", color: "#25579E" };
    }
  };

  return (
    <main className="customer-page">
      <div className="notifications-header-banner">
        <div className="notifications-header-content">
          <div>
            <p className="notifications-header-badge">Notifications</p>
            <h1 className="notifications-header-title">Stay Updated</h1>
            <p className="notifications-header-subtitle">
              {loading && notifications.length === 0
                ? "Loading..."
                : unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
            </p>
          </div>
          <div className="notifications-header-stats">
            <div className="notifications-stat-item">
              <span className="notifications-stat-number">{unreadCount}</span>
              <span className="notifications-stat-label">Unread</span>
            </div>
            <div className="notifications-stat-divider" />
            <div className="notifications-stat-item">
              <span className="notifications-stat-number">{readCount}</span>
              <span className="notifications-stat-label">Read</span>
            </div>
            <div className="notifications-stat-divider" />
            <div className="notifications-stat-item">
              <span className="notifications-stat-number">{total}</span>
              <span className="notifications-stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="notifications-header-subtitle" style={{ color: "#b42318", padding: "0 24px" }}>
          {error}
        </p>
      )}

      {unreadCount > 0 && (
        <div className="notifications-actions-row">
          <button className="notifications-mark-all-btn" onClick={handleMarkAllRead}>
            ✓ Mark All as Read
          </button>
        </div>
      )}

      <div className="notifications-tabs">
        <button
          className={`notifications-tab ${filter === "all" ? "notifications-tab-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({total})
        </button>
        <button
          className={`notifications-tab ${filter === "unread" ? "notifications-tab-active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`notifications-tab ${filter === "read" ? "notifications-tab-active" : ""}`}
          onClick={() => setFilter("read")}
        >
          Read ({readCount})
        </button>
      </div>

      <section className="notifications-list">
        {filtered.map((notif) => {
          const { icon, iconClass, color } = getTypeStyles(notif.type);
          return (
            <div
              key={notif.id}
              className={`notification-card ${notif.isRead ? "notification-card-read" : "notification-card-unread"}`}
              style={{ borderLeftColor: notif.isRead ? "transparent" : color }}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
            >
              <div className={`notification-icon ${iconClass}`}>{icon}</div>
              <div className="notification-content">
                <div className="notification-top-row">
                  <h3
                    className={`notification-title ${notif.isRead ? "notification-title-read" : "notification-title-unread"}`}
                  >
                    {notif.title}
                    {!notif.isRead && (
                      <span className="notification-unread-dot" style={{ background: color }} />
                    )}
                  </h3>
                </div>
                <p className="notification-text">{notif.body}</p>
                <span className="notification-time">{formatRelativeTime(notif.createdAt)}</span>
              </div>
            </div>
          );
        })}

        {!loading && filtered.length === 0 && (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">🔔</div>
            <h3 className="notifications-empty-title">No notifications</h3>
            <p className="notifications-empty-text">
              {filter === "unread" ? "You're all caught up!" : "No notifications to show."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
