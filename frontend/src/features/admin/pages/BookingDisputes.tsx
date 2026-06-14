import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import {
  clearAdminLookupCache,
  disputeBadgeClass,
  disputeStatusLabel,
  enrichDisputes,
  formatAdminDate,
} from "../../../api/adminHelpers";
import type { EnrichedDispute } from "../../../types/api.types";

export default function BookingDisputes() {
  const { fetchDisputes, resolveDispute, loading, error } = useAdmin();
  const [disputes, setDisputes] = useState<EnrichedDispute[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadDisputes = useCallback(async () => {
    clearAdminLookupCache();
    const rows = await fetchDisputes();
    setDisputes(await enrichDisputes(rows));
  }, [fetchDisputes]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const filtered = useMemo(() => {
    return disputes.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        d.customerName.toLowerCase().includes(q) ||
        d.providerName.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q) ||
        d.serviceTitle.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [disputes, search, statusFilter]);

  async function handleReview(id: string) {
    setActionId(id);
    const ok = await resolveDispute(id, { status: "under_review" });
    setActionId(null);
    if (ok) await loadDisputes();
  }

  async function handleResolve(id: string) {
    const note = window.prompt("Resolution note (optional):") ?? "";
    setActionId(id);
    const ok = await resolveDispute(id, {
      status: "resolved",
      resolutionNote: note,
    });
    setActionId(null);
    if (ok) await loadDisputes();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Booking Disputes</h1>
        <p className="page-subtitle">Resolve disputes between customers and providers</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Disputes</div>
            <div className="inv-toolbar-sub">
              {loading && disputes.length === 0 ? "Loading..." : `${filtered.length} disputes`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <select
              className="input-select"
              style={{ width: "auto" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="all">All</option>
            </select>
            <div className="inv-search-wrap">
              <input
                className="inv-search"
                placeholder="Search disputes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Dispute ID</th>
              <th>Booking</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Service</th>
              <th>Issue</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Filed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-muted">
                  {loading ? "Loading disputes..." : "No disputes match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((dispute) => (
                <tr key={dispute.id}>
                  <td className="fw-medium">{dispute.id}</td>
                  <td>{dispute.bookingId}</td>
                  <td>{dispute.customerName}</td>
                  <td>{dispute.providerName}</td>
                  <td>{dispute.serviceTitle}</td>
                  <td className="text-muted">{dispute.reason}</td>
                  <td>TZS {dispute.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${disputeBadgeClass(dispute.status)}`}>
                      {disputeStatusLabel(dispute.status)}
                    </span>
                  </td>
                  <td>{formatAdminDate(dispute.createdAt)}</td>
                  <td>
                    {dispute.status !== "resolved" ? (
                      <div className="flex gap-sm">
                        {dispute.status === "open" && (
                          <button
                            className="inv-action-btn inv-action-btn-primary"
                            disabled={actionId === dispute.id}
                            onClick={() => handleReview(dispute.id)}
                          >
                            Review
                          </button>
                        )}
                        <button
                          className="inv-action-btn inv-action-btn-success"
                          disabled={actionId === dispute.id}
                          onClick={() => handleResolve(dispute.id)}
                        >
                          Resolve
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted">{dispute.resolutionNote || "Resolved"}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
