import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { clearAdminLookupCache, enrichAdminReviews, formatAdminDate } from "../../../api/adminHelpers";
import type { EnrichedAdminReview } from "../../../types/api.types";

export default function Reviews() {
  const { fetchReviews, loading, error } = useAdmin();
  const [reviews, setReviews] = useState<EnrichedAdminReview[]>([]);
  const [search, setSearch] = useState("");

  const loadReviews = useCallback(async () => {
    clearAdminLookupCache();
    const rows = await fetchReviews();
    setReviews(await enrichAdminReviews(rows));
  }, [fetchReviews]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reviews.filter(
      (r) =>
        r.authorName.toLowerCase().includes(q) ||
        r.providerName.toLowerCase().includes(q) ||
        r.listingTitle.toLowerCase().includes(q) ||
        (r.comment || "").toLowerCase().includes(q)
    );
  }, [reviews, search]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reviews & Ratings</h1>
        <p className="page-subtitle">Monitor customer reviews and ratings</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Reviews</div>
            <div className="inv-toolbar-sub">
              {loading && reviews.length === 0 ? "Loading..." : `${filtered.length} reviews`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input
                className="inv-search"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Provider</th>
              <th>Listing</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted">
                  {loading ? "Loading reviews..." : "No reviews match your search."}
                </td>
              </tr>
            ) : (
              filtered.map((review) => (
                <tr key={review.id}>
                  <td className="fw-medium">{review.authorName}</td>
                  <td>{review.providerName}</td>
                  <td>{review.listingTitle}</td>
                  <td>{"⭐".repeat(review.rating)} {review.rating}/5</td>
                  <td className="text-muted" style={{ maxWidth: 250 }}>
                    {review.comment || "—"}
                  </td>
                  <td>
                    {review.isApproved ? (
                      <span className="badge badge-success">Published</span>
                    ) : (
                      <span className="badge badge-warning">Hidden</span>
                    )}
                  </td>
                  <td>{formatAdminDate(review.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
