import { useState } from "react";

const demoReviews = [
  { id: "REV-001", customer: "Juma Mwakyoma", provider: "Kilimo Best", service: "Tractor Rental", rating: 5, comment: "Excellent service, very professional!", date: "2026-05-20", status: "published" },
  { id: "REV-002", customer: "Fatima Jabir", provider: "AgriPro", service: "Seeds Supply", rating: 4, comment: "Good quality seeds, slightly delayed delivery", date: "2026-05-19", status: "published" },
  { id: "REV-003", customer: "David Shayo", provider: "Farm Help", service: "Irrigation Setup", rating: 5, comment: "Amazing work, transformed my farm!", date: "2026-05-18", status: "published" },
  { id: "REV-004", customer: "Grace Mushi", provider: "Green Tech", service: "Soil Testing", rating: 2, comment: "Results were inaccurate, disappointed", date: "2026-05-17", status: "published" },
  { id: "REV-005", customer: "Peter Tembo", provider: "Kilimo Best", service: "Harvesting", rating: 5, comment: "Fast and efficient harvesting service", date: "2026-05-16", status: "flagged" },
];

export default function Reviews() {
  const [search, setSearch] = useState("");

  const filtered = demoReviews.filter(r =>
    r.customer.toLowerCase().includes(search.toLowerCase()) ||
    r.comment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reviews & Ratings</h1>
        <p className="page-subtitle">Monitor customer reviews and ratings</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Reviews</div>
            <div className="inv-toolbar-sub">{filtered.length} reviews</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Provider</th>
              <th>Service</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(review => (
              <tr key={review.id}>
                <td className="fw-medium">{review.customer}</td>
                <td>{review.provider}</td>
                <td>{review.service}</td>
                <td>{"⭐".repeat(review.rating)} {review.rating}/5</td>
                <td className="text-muted" style={{ maxWidth: 250 }}>{review.comment}</td>
                <td>
                  {review.status === "published" ? (
                    <span className="badge badge-success">Published</span>
                  ) : (
                    <span className="badge badge-warning">Flagged</span>
                  )}
                </td>
                <td>{review.date}</td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">View</button>
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
