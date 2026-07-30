import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSubscriptions } from "../../../hooks/useSubscriptions";
import {
  formatMoney,
  formatSubscriptionDate,
  humanizeKey,
  subscriptionStatusBadge,
} from "../../../api/subscriptionHelpers";
import type {
  CurrentSubscription,
  SubscriptionPlan,
  VendorSubscription,
} from "../../../types/api.types";
import "../styles/subscriptions.css";

export default function MySubscription() {
  const { fetchCurrent, fetchHistory, fetchPlans, loading, error } = useSubscriptions();
  const [current, setCurrent] = useState<CurrentSubscription | null>(null);
  const [history, setHistory] = useState<VendorSubscription[]>([]);
  const [plansById, setPlansById] = useState<Record<string, SubscriptionPlan>>({});

  const loadData = useCallback(async () => {
    const [currentData, historyResult, plansResult] = await Promise.all([
      fetchCurrent(),
      fetchHistory({ page: "1", limit: "50" }),
      fetchPlans({ page: "1", limit: "100" }),
    ]);

    setCurrent(currentData);
    setHistory(historyResult.items);
    setPlansById(Object.fromEntries(plansResult.items.map((p) => [p.id, p])));
  }, [fetchCurrent, fetchHistory, fetchPlans]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const plan = current?.plan ?? null;
  const enabledFeatures = plan ? Object.entries(plan.features).filter(([, v]) => v) : [];
  const limits = plan ? Object.entries(plan.limits) : [];

  const planName = (planId: string) => plansById[planId]?.name || `Plan #${planId}`;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Subscription</h1>
        <p className="page-subtitle">Your current plan and subscription history</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="sub-current-banner">
        <div>
          <div className="sub-plan-name">
            {loading && !current ? "Loading..." : plan?.name || "—"}
          </div>
          <p className="sub-plan-desc" style={{ minHeight: 0, margin: "4px 0 0" }}>
            {plan?.description || ""}
          </p>
        </div>
        <div>
          <div className="sub-plan-price">
            {plan
              ? plan.price > 0
                ? formatMoney(plan.price, plan.currency)
                : "Free"
              : "—"}
          </div>
          <p className="sub-plan-desc" style={{ minHeight: 0, margin: 0 }}>
            {current
              ? current.endDate
                ? `Renews / expires ${formatSubscriptionDate(current.endDate)}`
                : "Never expires"
              : ""}
          </p>
        </div>
        <Link to="/provider/subscription/plans" className="inv-btn-submit" style={{ textDecoration: "none" }}>
          Upgrade Plan
        </Link>
      </div>

      {plan && (
        <div className="sub-plans-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          <div className="sub-plan-card">
            <div className="sub-plan-name">Plan Features</div>
            <ul className="sub-plan-list">
              {enabledFeatures.length === 0 ? (
                <li>No premium features on this plan</li>
              ) : (
                enabledFeatures.map(([key]) => <li key={key}>{humanizeKey(key)}</li>)
              )}
            </ul>
          </div>
          <div className="sub-plan-card">
            <div className="sub-plan-name">Plan Limits</div>
            <ul className="sub-plan-list">
              {limits.length === 0 ? (
                <li>No limits configured</li>
              ) : (
                limits.map(([key, value]) => (
                  <li key={key}>
                    {humanizeKey(key)}: <strong>{value}</strong>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Subscription History</div>
            <div className="inv-toolbar-sub">
              {loading && history.length === 0 ? "Loading..." : `${history.length} records`}
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted">
                  {loading ? "Loading history..." : "No subscription history yet."}
                </td>
              </tr>
            ) : (
              history.map((sub) => (
                <tr key={sub.id}>
                  <td className="fw-medium">{planName(sub.planId)}</td>
                  <td>
                    <span className={subscriptionStatusBadge(sub.status)}>{sub.status}</span>
                  </td>
                  <td>{formatSubscriptionDate(sub.startDate)}</td>
                  <td>{sub.endDate ? formatSubscriptionDate(sub.endDate) : "Never expires"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
