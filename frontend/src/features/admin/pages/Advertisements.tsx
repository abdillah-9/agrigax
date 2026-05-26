import { useState } from "react";

const demoAds = [
  { id: "ADS-001", title: "Premium Seeds Co", advertiser: "Premium Seeds Ltd", type: "sidebar", position: "listings_page", cost: 150000, status: "active", clicks: 450, startDate: "2026-05-01", endDate: "2026-06-01" },
  { id: "ADS-002", title: "Farm Equipment Sale", advertiser: "Tanzania Motors", type: "banner", position: "homepage", cost: 300000, status: "active", clicks: 890, startDate: "2026-05-10", endDate: "2026-06-10" },
  { id: "ADS-003", title: "Organic Fertilizer", advertiser: "Green Grow", type: "sidebar", position: "service_page", cost: 100000, status: "pending", clicks: 0, startDate: "2026-05-25", endDate: "2026-06-25" },
];

export default function Advertisements() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Advertisements</h1>
        <p className="page-subtitle">Manage third-party advertisements</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Ads</div>
            <div className="inv-toolbar-sub">{demoAds.length} advertisements</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search ads..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="inv-btn-create">
              <span className="inv-btn-create-icon">+</span> Create Ad
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Advertiser</th>
              <th>Type</th>
              <th>Cost</th>
              <th>Clicks</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoAds.map(ad => (
              <tr key={ad.id}>
                <td className="fw-medium">{ad.title}</td>
                <td>{ad.advertiser}</td>
                <td><span className="badge badge-info">{ad.type}</span></td>
                <td>TZS {ad.cost.toLocaleString()}</td>
                <td>{ad.clicks}</td>
                <td>{ad.startDate} to {ad.endDate}</td>
                <td>
                  {ad.status === "active" && <span className="badge badge-success">Active</span>}
                  {ad.status === "pending" && <span className="badge badge-warning">Pending</span>}
                  {ad.status === "expired" && <span className="badge badge-default">Expired</span>}
                </td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">Edit</button>
                    <button className="inv-action-btn inv-action-btn-danger">Remove</button>
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
