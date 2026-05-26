import { useState } from "react";

const demoBanners = [
  { id: "BAN-001", title: "Summer Farming Deals", image: "banner1.jpg", position: "homepage_top", status: "active", clicks: 2340, impressions: 12000, created: "2026-05-01" },
  { id: "BAN-002", title: "Join as Provider", image: "banner2.jpg", position: "sidebar", status: "active", clicks: 890, impressions: 8500, created: "2026-05-10" },
  { id: "BAN-003", title: "Livestock Sale", image: "banner3.jpg", position: "homepage_top", status: "inactive", clicks: 0, impressions: 0, created: "2026-05-19" },
];

export default function Banners() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Banners</h1>
        <p className="page-subtitle">Manage promotional banners across the platform</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Banners</div>
            <div className="inv-toolbar-sub">{demoBanners.length} banners</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search banners..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="inv-btn-create">
              <span className="inv-btn-create-icon">+</span> Add Banner
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Position</th>
              <th>Clicks</th>
              <th>Impressions</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoBanners.map(banner => (
              <tr key={banner.id}>
                <td className="fw-medium">{banner.title}</td>
                <td><span className="badge badge-default">{banner.position}</span></td>
                <td>{banner.clicks.toLocaleString()}</td>
                <td>{banner.impressions.toLocaleString()}</td>
                <td>
                  {banner.status === "active" ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-default">Inactive</span>
                  )}
                </td>
                <td>{banner.created}</td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">Edit</button>
                    <button className="inv-action-btn inv-action-btn-warning">
                      {banner.status === "active" ? "Deactivate" : "Activate"}
                    </button>
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
