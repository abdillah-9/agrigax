import { useState } from "react";

const demoNotifications = [
  { id: "PNT-001", title: "New Service Available", message: "Check out the new tractor services in your area", target: "all", sentTo: 1245, status: "sent", date: "2026-05-20" },
  { id: "PNT-002", title: "Booking Reminder", message: "Your booking with Kilimo Best is tomorrow", target: "customers", sentTo: 89, status: "sent", date: "2026-05-19" },
  { id: "PNT-003", title: "Payment Received", message: "You've received TZS 150,000 from Juma M.", target: "providers", sentTo: 45, status: "scheduled", date: "2026-05-21" },
];

export default function PushNotifications() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Push Notifications</h1>
        <p className="page-subtitle">Send targeted push notifications to users</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Notifications</div>
            <div className="inv-toolbar-sub">{demoNotifications.length} notifications</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search notifications..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="inv-btn-create">
              <span className="inv-btn-create-icon">+</span> Send Notification
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Target</th>
              <th>Sent To</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoNotifications.map(notif => (
              <tr key={notif.id}>
                <td className="fw-medium">{notif.title}</td>
                <td className="text-muted">{notif.message}</td>
                <td><span className="badge badge-info">{notif.target}</span></td>
                <td>{notif.sentTo} users</td>
                <td>
                  {notif.status === "sent" ? (
                    <span className="badge badge-success">Sent</span>
                  ) : (
                    <span className="badge badge-warning">Scheduled</span>
                  )}
                </td>
                <td>{notif.date}</td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">View</button>
                    <button className="inv-action-btn inv-action-btn-danger">Cancel</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
