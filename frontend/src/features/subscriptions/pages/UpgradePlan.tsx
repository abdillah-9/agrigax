import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscriptions } from "../../../hooks/useSubscriptions";
import {
  formatMoney,
  humanizeKey,
  paymentMethodSummary,
  planDurationLabel,
} from "../../../api/subscriptionHelpers";
import type {
  CurrentSubscription,
  PaymentMethod,
  SubscriptionPlan,
} from "../../../types/api.types";
import "../styles/subscriptions.css";

const emptyForm = { paymentMethodId: "", amount: "", transactionReference: "", receiptUrl: "", notes: "" };

export default function UpgradePlan() {
  const navigate = useNavigate();
  const { fetchPlans, fetchPaymentMethods, fetchCurrent, submitRequest, loading, error } =
    useSubscriptions();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [current, setCurrent] = useState<CurrentSubscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [plansResult, methodRows, currentData] = await Promise.all([
      fetchPlans({ page: "1", limit: "100" }),
      fetchPaymentMethods(),
      fetchCurrent(),
    ]);

    setPlans(plansResult.items);
    setMethods(methodRows);
    setCurrent(currentData);
  }, [fetchPlans, fetchPaymentMethods, fetchCurrent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openRequestForm(plan: SubscriptionPlan) {
    setSelectedPlan(plan);
    setForm({ ...emptyForm, amount: String(plan.price) });
    setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!form.paymentMethodId) {
      setFormError("Select the payment method you used.");
      return;
    }
    if (!form.transactionReference.trim()) {
      setFormError("Enter the transaction reference from your payment.");
      return;
    }
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setFormError("Enter the amount you paid.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    const created = await submitRequest({
      planId: selectedPlan.id,
      paymentMethodId: form.paymentMethodId,
      amount,
      transactionReference: form.transactionReference.trim(),
      receiptUrl: form.receiptUrl.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    setSubmitting(false);

    if (created) {
      setSelectedPlan(null);
      navigate("/provider/subscription/requests");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Upgrade Plan</h1>
        <p className="page-subtitle">
          Pay off-platform using one of the payment methods below, then submit your payment proof.
          An admin will verify it and activate your plan.
        </p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="sub-plans-grid">
        {plans.length === 0 && (
          <p className="text-muted">{loading ? "Loading plans..." : "No plans available right now."}</p>
        )}
        {plans.map((plan) => {
          const isCurrent = current?.planId === plan.id;
          const enabledFeatures = Object.entries(plan.features).filter(([, v]) => v);

          return (
            <div key={plan.id} className={`sub-plan-card${isCurrent ? " sub-plan-current" : ""}`}>
              <div className="sub-plan-name">
                {plan.name} {isCurrent && <span className="badge badge-success">Current</span>}
              </div>
              <div className="sub-plan-price">
                {plan.price > 0 ? formatMoney(plan.price, plan.currency) : "Free"}{" "}
                <small>/ {planDurationLabel(plan)}</small>
              </div>
              <p className="sub-plan-desc">{plan.description}</p>
              <ul className="sub-plan-list">
                {Object.entries(plan.limits).map(([key, value]) => (
                  <li key={key}>
                    {humanizeKey(key)}: <strong>{value}</strong>
                  </li>
                ))}
                {enabledFeatures.map(([key]) => (
                  <li key={key}>{humanizeKey(key)}</li>
                ))}
              </ul>
              <div className="sub-plan-cta">
                {plan.price > 0 && !isCurrent ? (
                  <button className="inv-btn-submit" onClick={() => openRequestForm(plan)}>
                    Upgrade to {plan.name}
                  </button>
                ) : (
                  <button className="inv-btn-cancel" disabled>
                    {isCurrent ? "Your current plan" : "Assigned automatically"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Payment Methods</div>
            <div className="inv-toolbar-sub">Pay using any of these, then submit your proof</div>
          </div>
        </div>
        <div className="sub-methods-grid">
          {methods.length === 0 ? (
            <p className="text-muted">
              {loading ? "Loading payment methods..." : "No payment methods configured yet."}
            </p>
          ) : (
            methods.map((method) => (
              <div key={method.id} className="sub-method-card">
                <span className="sub-method-name">{method.name}</span>
                <span className="text-muted">{humanizeKey(method.type)}</span>
                <span>{paymentMethodSummary(method)}</span>
                {method.instructions && <span className="text-muted">{method.instructions}</span>}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedPlan && (
        <div className="inv-modal-backdrop" onClick={() => setSelectedPlan(null)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div className="inv-modal-header-left">
                <div>
                  <div className="inv-modal-title">Submit Payment Proof — {selectedPlan.name}</div>
                  <div className="inv-modal-subtitle">
                    {formatMoney(selectedPlan.price, selectedPlan.currency)} /{" "}
                    {planDurationLabel(selectedPlan)}
                  </div>
                </div>
              </div>
              <button className="inv-modal-close" onClick={() => setSelectedPlan(null)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="inv-modal-body">
                {formError && (
                  <p className="page-subtitle" style={{ color: "#b42318" }}>{formError}</p>
                )}
                <div className="sub-form-grid">
                  <label>
                    Payment method used
                    <select
                      value={form.paymentMethodId}
                      onChange={(e) => setForm((p) => ({ ...p, paymentMethodId: e.target.value }))}
                      required
                    >
                      <option value="">Select a payment method...</option>
                      {methods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({paymentMethodSummary(m)})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Amount paid ({selectedPlan.currency})
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Transaction reference
                    <input
                      placeholder="e.g. M-Pesa confirmation code"
                      value={form.transactionReference}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, transactionReference: e.target.value }))
                      }
                      required
                    />
                  </label>
                  <label>
                    Receipt URL (optional)
                    <input
                      placeholder="Link to your uploaded receipt/screenshot"
                      value={form.receiptUrl}
                      onChange={(e) => setForm((p) => ({ ...p, receiptUrl: e.target.value }))}
                    />
                  </label>
                  <label>
                    Notes (optional)
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    />
                  </label>
                </div>
              </div>
              <div className="inv-modal-footer">
                <button type="button" className="inv-btn-cancel" onClick={() => setSelectedPlan(null)}>
                  Cancel
                </button>
                <button type="submit" className="inv-btn-submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
