import { useState } from "react";

const demoCategories = [
  { id: "CAT-001", name: "Farm Inputs", slug: "farm-inputs", listings: 245, icon: "🌱", isActive: true },
  { id: "CAT-002", name: "Equipment", slug: "equipment", listings: 189, icon: "🚜", isActive: true },
  { id: "CAT-003", name: "Labor", slug: "labor", listings: 156, icon: "👨‍🌾", isActive: true },
  { id: "CAT-004", name: "Livestock", slug: "livestock", listings: 98, icon: "🐄", isActive: true },
  { id: "CAT-005", name: "Technology", slug: "technology", listings: 67, icon: "💻", isActive: true },
  { id: "CAT-006", name: "Transport", slug: "transport", listings: 34, icon: "🚚", isActive: false },
  { id: "CAT-007", name: "Storage", slug: "storage", listings: 28, icon: "🏪", isActive: true },
];

export default function Categories() {
  const [search, setSearch] = useState("");

  const filtered = demoCategories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Manage service categories</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Categories</div>
            <div className="inv-toolbar-sub">{filtered.length} categories</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="inv-btn-create">
              <span className="inv-btn-create-icon">+</span> Add Category
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Listings</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(cat => (
              <tr key={cat.id}>
                <td className="fw-medium">
                  <span className="text-lg">{cat.icon}</span> {cat.name}
                </td>
                <td className="text-muted">{cat.slug}</td>
                <td>{cat.listings}</td>
                <td>
                  {cat.isActive ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-default">Inactive</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">Edit</button>
                    <button className="inv-action-btn inv-action-btn-warning">
                      {cat.isActive ? "Deactivate" : "Activate"}
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
