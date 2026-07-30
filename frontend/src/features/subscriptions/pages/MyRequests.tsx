import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSubscriptions } from "../../../hooks/useSubscriptions";
import {
  formatMoney,
  formatSubscriptionDate,
  requestStatusBadge,
} from "../../../api/subscriptionHelpers";
import type {
  PaymentMethod,
  SubscriptionPlan,
  SubscriptionRequest,
} from "../../../types/api.types";
import "../styles/subscriptions.css";

export default function MyRequests() {
  const { fetchMyRequests, fetchPlans, fetchPaymentMethods, loading, error } = useSubscriptions();
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [plansById, setPlansById] = useState<Record<string, SubscriptionPlan>>({});
  const [methodsById, setMethodsById] = useState<Record<string, PaymentMethod>>({});
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    const params: Record<string, string> = { page: "1", limit: "100" };
    if (statusFilter !== "all") params.status = statusFilter;

    const [requestsResult, plansResult, methodRows] = await Promise.all([
      fetchMyRequests(params),
      fetchPlans({ page: "1", limit: "100" }),
      fetchPaymentMethods(),
    ]);

    setRequests(requestsResult.items);
    setPlansById(Object.fromEntries(plansResult.items.map((p) => [p.id, p])));
    setMethodsById(Object.fromEntries(methodRows.map((m) => [m.id, m])));
  }, [fetchMyRequests, fetchPlans, fetchPaymentMethods, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subscription Requests</h1>
        <p className="page-subtitle">Track the payment proofs you've submitted for verification</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">My Requests</div>
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
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
            <Link to="/provider/subscription/plans" className="inv-btn-create" style={{ textDecoration: "none" }}>
              <span className="inv-btn-create-icon">+</span> New Request
            </Link>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Verified</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted">
                  {loading ? "Loading requests..." : "No subscription requests yet."}
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const plan = plansById[req.planId];
                const method = methodsById[req.paymentMethodId];
                return (
                  <tr key={req.id}>
                    <td className="fw-medium">{plan?.name || `Plan #${req.planId}`}</td>
                    <td>{method?.name || `Method #${req.paymentMethodId}`}</td>
                    <td>{formatMoney(req.amount, plan?.currency)}</td>
                    <td className="text-muted">{req.transactionReference}</td>
                    <td>
                      <span className={requestStatusBadge(req.status)}>{req.status}</span>
                    </td>
                    <td>{formatSubscriptionDate(req.createdAt)}</td>
                    <td>{req.verifiedAt ? formatSubscriptionDate(req.verifiedAt) : "—"}</td>
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
