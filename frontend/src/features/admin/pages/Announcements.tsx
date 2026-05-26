import { useState } from "react";

const demoAnnouncements = [
  { id: "ANN-001", title: "Platform Maintenance", content: "Scheduled maintenance on May 25th, 2AM-4AM", audience: "all", status: "published", created: "2026-05-20" },
  { id: "ANN-002", title: "New Feature: Wallet Top-up", content: "Users can now top-up wallets via Airtel Money", audience: "customers", status: "published", created: "2026-05-18" },
  { id: "ANN-003", title: "Provider Verification Update", content: "New document requirements for provider verification", audience: "providers", status: "draft", created: "2026-05-19" },
];

export default function Announcements() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Announcements</h1>
        <p className="page-subtitle">Create and manage platform announcements</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Announcements</div>
            <div className="inv-toolbar-sub">{demoAnnouncements.length} announcements</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search announcements..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="inv-btn-create">
              <span className="inv-btn-create-icon">+</span> New Announcement
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Content</th>
              <th>Audience</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoAnnouncements.map(ann => (
              <tr key={ann.id}>
                <td className="fw-medium">{ann.title}</td>
                <td className="text-muted">{ann.content}</td>
                <td><span className="badge badge-info">{ann.audience}</span></td>
                <td>
                  {ann.status === "published" ? (
                    <span className="badge badge-success">Published</span>
                  ) : (
                    <span className="badge badge-default">Draft</span>
                  )}
                </td>
                <td>{ann.created}</td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">Edit</button>
                    <button className="inv-action-btn inv-action-btn-danger">Delete</button>
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
