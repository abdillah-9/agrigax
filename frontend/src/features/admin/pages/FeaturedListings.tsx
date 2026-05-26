import { useState } from "react";

const demoFeatured = [
  { id: "FEA-001", title: "Premium Tractor Service", provider: "Kilimo Best", type: "equipment", price: 200000, featuredSince: "2026-05-01", expires: "2026-06-01", clicks: 450 },
  { id: "FEA-002", title: "Organic Seeds Bundle", provider: "AgriPro", type: "product", price: 35000, featuredSince: "2026-05-10", expires: "2026-06-10", clicks: 320 },
  { id: "FEA-003", title: "Irrigation Installation", provider: "Green Tech", type: "service", price: 500000, featuredSince: "2026-05-15", expires: "2026-06-15", clicks: 180 },
];

export default function FeaturedListings() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Featured Listings</h1>
        <p className="page-subtitle">Manage promoted and featured services</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Featured Services</div>
            <div className="inv-toolbar-sub">{demoFeatured.length} featured listings</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search featured..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="inv-btn-create">
              <span className="inv-btn-create-icon">+</span> Feature Listing
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Provider</th>
              <th>Type</th>
              <th>Price</th>
              <th>Featured Since</th>
              <th>Expires</th>
              <th>Clicks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoFeatured.map(item => (
              <tr key={item.id}>
                <td className="fw-medium">{item.title}</td>
                <td>{item.provider}</td>
                <td><span className="badge badge-info">{item.type}</span></td>
                <td>TZS {item.price.toLocaleString()}</td>
                <td>{item.featuredSince}</td>
                <td>{item.expires}</td>
                <td>{item.clicks}</td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">Extend</button>
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
