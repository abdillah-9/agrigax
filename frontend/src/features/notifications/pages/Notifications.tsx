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

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return { icon: "✓", bg: "bg-success-light", color: "#1F5A38" };
      case "warning": return { icon: "!", bg: "bg-warning-light", color: "#9C8B3D" };
      case "info": return { icon: "i", bg: "bg-info-light", color: "#25579E" };
      default: return { icon: "•", bg: "bg-neutral-lighter", color: "#666" };
    }
  };

  return (
    <main className="p-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-xl flex-wrap gap-md">
        <div>
          <h1 className="text-2xl fw-bold neutral-dark">Notifications</h1>
          <p className="text-sm text-muted mt-sm">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"} · {notifications.length} total
          </p>
        </div>
        <div className="flex gap-sm">
          {unreadCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead}>
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-sm mb-lg">
        {[
          { key: "all", label: `All (${notifications.length})` },
          { key: "unread", label: `Unread (${unreadCount})` },
          { key: "read", label: `Read (${notifications.length - unreadCount})` },
        ].map(f => (
          <button
            key={f.key}
            className={`tab-btn ${filter === f.key ? "tab-btn-active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <section className="notifications-list">
        {filtered.map(notif => {
          const { icon, bg, color } = getIcon(notif.type);
          return (
            <div
              key={notif.id}
              className="notification-card shadow-sm radius-lg"
              style={{
                opacity: notif.read ? 0.7 : 1,
                cursor: "pointer",
                borderLeft: notif.read ? "3px solid transparent" : `3px solid ${color}`,
              }}
              onClick={() => handleMarkRead(notif.id)}
            >
              <div className={`notification-icon ${bg}`} style={{ color, fontWeight: 700 }}>
                {icon}
              </div>
              <div className="notification-content" style={{ flex: 1 }}>
                <div className="flex justify-between items-start">
                  <h3 className={`text-sm ${notif.read ? "fw-medium" : "fw-semibold"} neutral-dark`}>
                    {notif.title}
                    {!notif.read && (
                      <span style={{
                        display: "inline-block", width: 8, height: 8,
                        borderRadius: "50%", background: color,
                        marginLeft: 8, verticalAlign: "middle"
                      }} />
                    )}
                  </h3>
                  <button
                    className="text-xs text-muted"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm notification-text">{notif.message}</p>
                <span className="notification-time">{notif.time}</span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="table-empty">
            <p style={{ fontSize: 40, marginBottom: 8 }}>🔔</p>
            <p className="fw-medium">No notifications</p>
            <p className="text-sm text-muted mt-sm">
              {filter === "unread" ? "You're all caught up!" : "No notifications to show."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
