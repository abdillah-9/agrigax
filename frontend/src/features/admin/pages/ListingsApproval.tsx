import { useState } from "react";

const demoListings = [
  { id: "LST-001", title: "Tractor Rental Service", type: "equipment", category: "Machinery", provider: "Kilimo Best Supplies", price: 150000, status: "pending", submittedDate: "2026-05-20" },
  { id: "LST-002", title: "Organic Tomato Seeds", type: "product", category: "Seeds", provider: "AgriPro Solutions", price: 25000, status: "pending", submittedDate: "2026-05-19" },
  { id: "LST-003", title: "Farm Labor - Planting", type: "worker", category: "Labor", provider: "Farm Help Services", price: 50000, status: "pending", submittedDate: "2026-05-19" },
  { id: "LST-004", title: "Drip Irrigation Setup", type: "service", category: "Irrigation", provider: "Green Tech Agri", price: 320000, status: "pending", submittedDate: "2026-05-18" },
  { id: "LST-005", title: "Dairy Cows - Friesian", type: "livestock", category: "Livestock", provider: "Tanzania Livestock Co", price: 1200000, status: "pending", submittedDate: "2026-05-18" },
  { id: "LST-006", title: "Soil Testing Kit", type: "product", category: "Tools", provider: "AgriPro Solutions", price: 45000, status: "approved", submittedDate: "2026-05-15" },
  { id: "LST-007", title: "Maize Harvester", type: "equipment", category: "Machinery", provider: "Kilimo Best Supplies", price: 200000, status: "rejected", submittedDate: "2026-05-14" },
];

export default function ListingsApproval() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const filtered = demoListings.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.provider.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Listings Approval</h1>
        <p className="page-subtitle">Review and approve service listings</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Service Listings</div>
            <div className="inv-toolbar-sub">{filtered.length} listings</div>
          </div>
          <div className="inv-toolbar-right">
            <select className="input-select" style={{ width: "auto" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Listing ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>Provider</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(listing => (
              <tr key={listing.id}>
                <td className="fw-medium">{listing.id}</td>
                <td>{listing.title}</td>
                <td><span className="badge badge-default">{listing.type}</span></td>
                <td>{listing.category}</td>
                <td>{listing.provider}</td>
                <td>TZS {listing.price.toLocaleString()}</td>
                <td>
                  {listing.status === "pending" && <span className="badge badge-warning">Pending</span>}
                  {listing.status === "approved" && <span className="badge badge-success">Approved</span>}
                  {listing.status === "rejected" && <span className="badge badge-danger">Rejected</span>}
                </td>
                <td>
                  {listing.status === "pending" ? (
                    <div className="flex gap-sm">
                      <button className="inv-action-btn inv-action-btn-success">Approve</button>
                      <button className="inv-action-btn inv-action-btn-danger">Reject</button>
                    </div>
                  ) : (
                    <button className="inv-action-btn inv-action-btn-primary">View</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
