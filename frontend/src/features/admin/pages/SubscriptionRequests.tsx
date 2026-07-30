import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { useAdminSubscriptions } from "../../../hooks/useAdminSubscriptions";
import {
  formatMoney,
  formatSubscriptionDate,
  requestStatusBadge,
} from "../../../api/subscriptionHelpers";
import type {
  AdminProvider,
  SubscriptionPlan,
  SubscriptionRequest,
  SubscriptionRequestDetail,
} from "../../../types/api.types";
import "../../subscriptions/styles/subscriptions.css";

export default function SubscriptionRequests() {
  const {
    fetchRequests,
    fetchRequestDetail,
    approveRequest,
    rejectRequest,
    fetchPlans,
    loading,
    error,
  } = useAdminSubscriptions();
  const { fetchProviders } = useAdmin();

  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [plansById, setPlansById] = useState<Record<string, SubscriptionPlan>>({});
  const [vendorsById, setVendorsById] = useState<Record<string, AdminProvider>>({});
  const [statusFilter, setStatusFilter] = useState("pending");
  const [detail, setDetail] = useState<SubscriptionRequestDetail | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const loadData = useCallback(async () => {
    const params: Record<string, string> = { page: "1", limit: "100" };
    if (statusFilter !== "all") params.status = statusFilter;

    const [requestsResult, plansResult, providersResult] = await Promise.all([
      fetchRequests(params),
      fetchPlans({ page: "1", limit: "100" }),
      fetchProviders({ page: "1", limit: "100" }),
    ]);

    setRequests(requestsResult.items);
    setPlansById(Object.fromEntries(plansResult.items.map((p) => [p.id, p])));
    setVendorsById(Object.fromEntries(providersResult.items.map((v) => [v.id, v])));
  }, [fetchRequests, fetchPlans, fetchProviders, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const vendorName = (vendorId: string) =>
    vendorsById[vendorId]?.fullName || vendorsById[vendorId]?.username || `Vendor #${vendorId}`;
  const planName = (planId: string) => plansById[planId]?.name || `Plan #${planId}`;

  async function openDetail(request: SubscriptionRequest) {
    const data = await fetchRequestDetail(request.id);
    if (data) {
      setDetail(data);
      setShowReject(false);
      setRejectComment("");
    }
  }

  async function handleApprove() {
    if (!detail) return;
    if (!window.confirm(`Approve this request and activate ${planName(detail.planId)} for ${vendorName(detail.vendorId)}?`)) {
      return;
    }
    setActionBusy(true);
    const result = await approveRequest(detail.id);
    setActionBusy(false);
    if (result) {
      setDetail(null);
      await loadData();
    }
  }

  async function handleReject() {
    if (!detail) return;
    setActionBusy(true);
    const result = await rejectRequest(detail.id, rejectComment.trim() || undefined);
    setActionBusy(false);
    if (result) {
      setDetail(null);
      await loadData();
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subscription Requests</h1>
        <p className="page-subtitle">
          Verify vendor payment proofs against your mobile money / bank statements, then approve or reject
        </p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Requests</div>
            <div className="inv-toolbar-sub">
              {loading && requests.length === 0 ? "Loading..." : `${requests.length} requests`}
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="all">All Status</option>
            </select>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted">
                  {loading ? "Loading requests..." : "No requests found."}
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td className="fw-medium">{vendorName(req.vendorId)}</td>
                  <td>{planName(req.planId)}</td>
                  <td>{formatMoney(req.amount, plansById[req.planId]?.currency)}</td>
                  <td className="text-muted">{req.transactionReference}</td>
                  <td>
                    <span className={requestStatusBadge(req.status)}>{req.status}</span>
                  </td>
                  <td>{formatSubscriptionDate(req.createdAt)}</td>
                  <td>
                    <button className="inv-action-btn" onClick={() => openDetail(req)}>
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="inv-modal-backdrop" onClick={() => setDetail(null)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div className="inv-modal-header-left">
                <div>
                  <div className="inv-modal-title">Request #{detail.id}</div>
                  <div className="inv-modal-subtitle">
                    {vendorName(detail.vendorId)} → {planName(detail.planId)}
                  </div>
                </div>
              </div>
              <button className="inv-modal-close" onClick={() => setDetail(null)}>
                ×
              </button>
            </div>
            <div className="inv-modal-body">
              <div className="sub-form-grid" style={{ fontSize: "14px" }}>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className={requestStatusBadge(detail.status)}>{detail.status}</span>
                </div>
                <div>
                  <strong>Amount:</strong>{" "}
                  {formatMoney(detail.amount, plansById[detail.planId]?.currency)}
                </div>
                <div>
                  <strong>Transaction reference:</strong> {detail.transactionReference}
                </div>
                <div>
                  <strong>Receipt:</strong>{" "}
                  {detail.receiptUrl ? (
                    <a href={detail.receiptUrl} target="_blank" rel="noreferrer">
                      View receipt
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </div>
                <div>
                  <strong>Vendor notes:</strong> {detail.notes || "—"}
                </div>
                <div>
                  <strong>Submitted:</strong> {formatSubscriptionDate(detail.createdAt)}
                </div>
                {detail.verifiedAt && (
                  <div>
                    <strong>Verified:</strong> {formatSubscriptionDate(detail.verifiedAt)}
                  </div>
                )}

                {detail.logs.length > 0 && (
                  <div>
                    <strong>Audit trail</strong>
                    <table className="data-table" style={{ marginTop: "8px" }}>
                      <thead>
                        <tr>
                          <th>Action</th>
                          <th>Comment</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.logs.map((log) => (
                          <tr key={log.id}>
                            <td>
                              <span className={log.action === "approved" ? "badge badge-success" : "badge badge-danger"}>
                                {log.action}
                              </span>
                            </td>
                            <td className="text-muted">{log.comment || "—"}</td>
                            <td>{formatSubscriptionDate(log.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {showReject && detail.status === "pending" && (
                  <label>
                    Rejection reason (sent to the vendor)
                    <textarea
                      rows={3}
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="e.g. Reference number not found in our statement"
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="inv-modal-footer">
              <button type="button" className="inv-btn-cancel" onClick={() => setDetail(null)}>
                Close
              </button>
              {detail.status === "pending" && !showReject && (
                <>
                  <button
                    type="button"
                    className="inv-action-btn inv-action-btn-danger"
                    onClick={() => setShowReject(true)}
                  >
                    Reject...
                  </button>
                  <button
                    type="button"
                    className="inv-btn-submit"
                    disabled={actionBusy}
                    onClick={handleApprove}
                  >
                    {actionBusy ? "Working..." : "Approve & Activate"}
                  </button>
                </>
              )}
              {detail.status === "pending" && showReject && (
                <button
                  type="button"
                  className="inv-action-btn inv-action-btn-danger"
                  disabled={actionBusy}
                  onClick={handleReject}
                >
                  {actionBusy ? "Working..." : "Confirm Rejection"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
