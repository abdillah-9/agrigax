import { useState } from "react";

const demoProviders = [
  { id: "PRV-001", businessName: "Kilimo Best Supplies", ownerName: "Amina Khamis", email: "amina@email.com", phone: "+255 713 456 789", category: "Farm Inputs", totalListings: 24, rating: 4.8, isVerified: true, joinedDate: "2026-02-20" },
  { id: "PRV-002", businessName: "AgriPro Solutions", ownerName: "Hassan Petro", email: "hassan@email.com", phone: "+255 714 567 890", category: "Equipment", totalListings: 15, rating: 4.5, isVerified: true, joinedDate: "2026-03-10" },
  { id: "PRV-003", businessName: "Farm Help Services", ownerName: "Rashid Msuya", email: "rashid@email.com", phone: "+255 716 789 012", category: "Labor", totalListings: 8, rating: 4.2, isVerified: true, joinedDate: "2026-04-15" },
  { id: "PRV-004", businessName: "Green Tech Agri", ownerName: "Neema Mwakaje", email: "neema@email.com", phone: "+255 720 123 456", category: "Technology", totalListings: 12, rating: 4.6, isVerified: false, joinedDate: "2026-04-25" },
  { id: "PRV-005", businessName: "Tanzania Livestock Co", ownerName: "John Mlay", email: "john@email.com", phone: "+255 721 234 567", category: "Livestock", totalListings: 30, rating: 4.9, isVerified: true, joinedDate: "2026-01-05" },
];

export default function Providers() {
  const [search, setSearch] = useState("");

  const filtered = demoProviders.filter(p =>
    p.businessName.toLowerCase().includes(search.toLowerCase()) ||
    p.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Provider Management</h1>
        <p className="page-subtitle">Manage service providers on the platform</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Providers</div>
            <div className="inv-toolbar-sub">{filtered.length} providers</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search providers..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="inv-btn-create">
              <span className="inv-btn-create-icon">+</span> Add Provider
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Owner</th>
              <th>Category</th>
              <th>Listings</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(provider => (
              <tr key={provider.id}>
                <td className="fw-medium">{provider.businessName}</td>
                <td>{provider.ownerName}</td>
                <td><span className="badge badge-default">{provider.category}</span></td>
                <td>{provider.totalListings}</td>
                <td>⭐ {provider.rating}</td>
                <td>
                  {provider.isVerified ? (
                    <span className="badge badge-success">Verified</span>
                  ) : (
                    <span className="badge badge-warning">Pending</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">View</button>
                    <button className="inv-action-btn inv-action-btn-secondary">Edit</button>
                    {!provider.isVerified && (
                      <button className="inv-action-btn inv-action-btn-success">Verify</button>
                    )}
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
