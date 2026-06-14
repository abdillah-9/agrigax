import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import {
  clearAdminLookupCache,
  enrichPendingListings,
  listingApprovalStatus,
} from "../../../api/adminHelpers";
import type { Category, EnrichedPendingListing } from "../../../types/api.types";

export default function ListingsApproval() {
  const { fetchPendingListings, fetchCategories, approveListing, rejectListing, loading, error } =
    useAdmin();
  const [listings, setListings] = useState<EnrichedPendingListing[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    clearAdminLookupCache();
    const [{ items: listingRows }, { items: categories }] = await Promise.all([
      fetchPendingListings({ page: "1", limit: "100" }),
      fetchCategories({ page: "1", limit: "100" }),
    ]);
    setListings(await enrichPendingListings(listingRows, categories as Category[]));
  }, [fetchPendingListings, fetchCategories]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        l.title.toLowerCase().includes(q) ||
        l.providerName.toLowerCase().includes(q) ||
        l.categoryName.toLowerCase().includes(q);
      const status = listingApprovalStatus(l);
      const matchStatus = statusFilter === "all" || status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [listings, search, statusFilter]);

  async function handleApprove(id: string) {
    setActionId(id);
    const ok = await approveListing(id);
    setActionId(null);
    if (ok) await loadListings();
  }

  async function handleReject(id: string) {
    setActionId(id);
    const ok = await rejectListing(id);
    setActionId(null);
    if (ok) await loadListings();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Listings Approval</h1>
        <p className="page-subtitle">Review and approve service listings awaiting moderation</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Unapproved Listings</div>
            <div className="inv-toolbar-sub">
              {loading && listings.length === 0 ? "Loading..." : `${filtered.length} listings`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <select
              className="input-select"
              style={{ width: "auto" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Unapproved</option>
            </select>
            <div className="inv-search-wrap">
              <input
                className="inv-search"
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-muted">
                  {loading ? "Loading listings..." : "No listings match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((listing) => {
                const status = listingApprovalStatus(listing);
                return (
                  <tr key={listing.id}>
                    <td className="fw-medium">{listing.id}</td>
                    <td>{listing.title}</td>
                    <td><span className="badge badge-default">{listing.type}</span></td>
                    <td>{listing.categoryName}</td>
                    <td>{listing.providerName}</td>
                    <td>TZS {listing.price.toLocaleString()}</td>
                    <td>
                      {status === "pending" && <span className="badge badge-warning">Pending</span>}
                      {status === "rejected" && <span className="badge badge-danger">Rejected</span>}
                      {status === "approved" && <span className="badge badge-success">Approved</span>}
                    </td>
                    <td>
                      {status === "pending" ? (
                        <div className="flex gap-sm">
                          <button
                            className="inv-action-btn inv-action-btn-success"
                            disabled={actionId === listing.id}
                            onClick={() => handleApprove(listing.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="inv-action-btn inv-action-btn-danger"
                            disabled={actionId === listing.id}
                            onClick={() => handleReject(listing.id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
