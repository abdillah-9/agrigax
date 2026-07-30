import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { useAdminSubscriptions } from "../../../hooks/useAdminSubscriptions";
import {
  formatSubscriptionDate,
  subscriptionStatusBadge,
} from "../../../api/subscriptionHelpers";
import type {
  AdminProvider,
  SubscriptionPlan,
  VendorSubscription,
} from "../../../types/api.types";

export default function VendorSubscriptions() {
  const { fetchVendorSubscriptions, fetchPlans, loading, error } = useAdminSubscriptions();
  const { fetchProviders } = useAdmin();

  const [subscriptions, setSubscriptions] = useState<VendorSubscription[]>([]);
  const [plansById, setPlansById] = useState<Record<string, SubscriptionPlan>>({});
  const [vendorsById, setVendorsById] = useState<Record<string, AdminProvider>>({});
  const [statusFilter, setStatusFilter] = useState("active");
  const [expiringSoon, setExpiringSoon] = useState(false);

  const loadData = useCallback(async () => {
    const params: Record<string, string> = { page: "1", limit: "100" };
    if (expiringSoon) {
      params.expiringWithinDays = "7";
    } else if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    const [subsResult, plansResult, providersResult] = await Promise.all([
      fetchVendorSubscriptions(params),
      fetchPlans({ page: "1", limit: "100" }),
      fetchProviders({ page: "1", limit: "100" }),
    ]);

    setSubscriptions(subsResult.items);
    setPlansById(Object.fromEntries(plansResult.items.map((p) => [p.id, p])));
    setVendorsById(Object.fromEntries(providersResult.items.map((v) => [v.id, v])));
  }, [fetchVendorSubscriptions, fetchPlans, fetchProviders, statusFilter, expiringSoon]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const vendorName = (vendorId: string) =>
    vendorsById[vendorId]?.fullName || vendorsById[vendorId]?.username || `Vendor #${vendorId}`;
  const planName = (planId: string) => plansById[planId]?.name || `Plan #${planId}`;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Vendor Subscriptions</h1>
        <p className="page-subtitle">Subscription history, active plans, and upcoming expirations</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Subscriptions</div>
            <div className="inv-toolbar-sub">
              {loading && subscriptions.length === 0 ? "Loading..." : `${subscriptions.length} records`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
              <input
                type="checkbox"
                checked={expiringSoon}
                onChange={(e) => setExpiringSoon(e.target.checked)}
              />
              Expiring within 7 days
            </label>
            <select
              className="input-select"
              style={{ width: "auto" }}
              value={statusFilter}
              disabled={expiringSoon}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
              <option value="all">All Status</option>
            </select>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted">
                  {loading ? "Loading subscriptions..." : "No subscriptions found."}
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="fw-medium">{vendorName(sub.vendorId)}</td>
                  <td>{planName(sub.planId)}</td>
                  <td>
                    <span className={subscriptionStatusBadge(sub.status)}>{sub.status}</span>
                  </td>
                  <td>{formatSubscriptionDate(sub.startDate)}</td>
                  <td>{sub.endDate ? formatSubscriptionDate(sub.endDate) : "Never expires"}</td>
                  <td className="text-muted">
                    {sub.createdFromRequestId
                      ? `Request #${sub.createdFromRequestId}`
                      : "Auto-assigned"}
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
