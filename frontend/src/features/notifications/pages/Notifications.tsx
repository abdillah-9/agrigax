import { useState } from "react";
import "../styles/notifications.css";

const initialNotifications = [
  { id: "1", title: "Booking Confirmed", message: "Your tractor rental booking with Kilimo Best has been approved.", type: "success", time: "2 minutes ago", read: false },
  { id: "2", title: "Payment Received", message: "TZS 120,000 received for booking BK-001.", type: "success", time: "15 minutes ago", read: false },
  { id: "3", title: "New Service Available", message: "New irrigation services are now available near Dar es Salaam.", type: "info", time: "1 hour ago", read: false },
  { id: "4", title: "Booking Reminder", message: "Your irrigation setup with Green Tech is scheduled for tomorrow.", type: "warning", time: "3 hours ago", read: true },
  { id: "5", title: "Withdrawal Processed", message: "Your withdrawal of TZS 200,000 has been sent to your M-Pesa.", type: "success", time: "5 hours ago", read: true },
  { id: "6", title: "New Review", message: "Juma M. left a 5-star review on your tractor rental service.", type: "info", time: "Yesterday", read: true },
  { id: "7", title: "Listing Expiring Soon", message: "Your 'Soil Testing' listing expires in 3 days. Renew it to stay visible.", type: "warning", time: "Yesterday", read: false },
  { id: "8", title: "Account Verification", message: "Your provider account has been verified successfully.", type: "success", time: "2 days ago", read: true },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all");

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success": return { icon: "✓", iconClass: "notification-icon-success", color: "#1F5A38" };
      case "warning": return { icon: "!", iconClass: "notification-icon-warning", color: "#9C8B3D" };
      case "info": return { icon: "i", iconClass: "notification-icon-info", color: "#25579E" };
      default: return { icon: "•", iconClass: "notification-icon-info", color: "#666" };
    }
  };

  return (
    <main className="customer-page">
      {/* Header Banner */}
      <div className="notifications-header-banner">
        <div className="notifications-header-content">
          <div>
            <p className="notifications-header-badge">Notifications</p>
            <h1 className="notifications-header-title">Stay Updated</h1>
            <p className="notifications-header-subtitle">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up! ✨'}
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
              <span className="notifications-stat-number">{notifications.length}</span>
              <span className="notifications-stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      {unreadCount > 0 && (
        <div className="notifications-actions-row">
          <button className="notifications-mark-all-btn" onClick={handleMarkAllRead}>
            ✓ Mark All as Read
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="notifications-tabs">
        <button
          className={`notifications-tab ${filter === "all" ? "notifications-tab-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
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

      {/* Notifications List */}
      <section className="notifications-list">
        {filtered.map(notif => {
          const { icon, iconClass, color } = getTypeStyles(notif.type);
          return (
            <div
              key={notif.id}
              className={`notification-card ${notif.read ? "notification-card-read" : "notification-card-unread"}`}
              style={{ borderLeftColor: notif.read ? "transparent" : color }}
              onClick={() => handleMarkRead(notif.id)}
            >
              <div className={`notification-icon ${iconClass}`}>
                {icon}
              </div>
              <div className="notification-content">
                <div className="notification-top-row">
                  <h3 className={`notification-title ${notif.read ? "notification-title-read" : "notification-title-unread"}`}>
                    {notif.title}
                    {!notif.read && (
                      <span className="notification-unread-dot" style={{ background: color }} />
                    )}
                  </h3>
                  <button
                    className="notification-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
                <p className="notification-text">{notif.message}</p>
                <span className="notification-time">{notif.time}</span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
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