import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdminSubscriptions } from "../../../hooks/useAdminSubscriptions";
import { formatMoney, planDurationLabel } from "../../../api/subscriptionHelpers";
import type { SubscriptionPlan, SubscriptionPlanPayload } from "../../../types/api.types";
import "../../subscriptions/styles/subscriptions.css";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  currency: "TZS",
  durationDays: "30",
  features: '{\n  "analytics": false,\n  "verifiedBadge": false,\n  "prioritySupport": false\n}',
  limits: '{\n  "maxListings": 5,\n  "maxFeaturedListings": 0,\n  "maxImagesPerListing": 5\n}',
  isDefaultVendorPlan: false,
  isActive: true,
};

type PlanForm = typeof emptyForm;

function parsePlanForm(form: PlanForm): { payload?: SubscriptionPlanPayload; error?: string } {
  let features: Record<string, boolean>;
  let limits: Record<string, number>;

  try {
    features = JSON.parse(form.features);
  } catch {
    return { error: "Features must be valid JSON (e.g. {\"analytics\": true})" };
  }
  try {
    limits = JSON.parse(form.limits);
  } catch {
    return { error: "Limits must be valid JSON (e.g. {\"maxListings\": 20})" };
  }

  if (Object.values(features).some((v) => typeof v !== "boolean")) {
    return { error: "All feature values must be true or false" };
  }
  if (Object.values(limits).some((v) => typeof v !== "number")) {
    return { error: "All limit values must be numbers" };
  }

  return {
    payload: {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      currency: form.currency.trim() || "TZS",
      durationDays: Number(form.durationDays) || 30,
      features,
      limits,
      isDefaultVendorPlan: form.isDefaultVendorPlan,
      isActive: form.isActive,
    },
  };
}

function planToForm(plan: SubscriptionPlan): PlanForm {
  return {
    name: plan.name,
    description: plan.description,
    price: String(plan.price),
    currency: plan.currency,
    durationDays: String(plan.durationDays),
    features: JSON.stringify(plan.features, null, 2),
    limits: JSON.stringify(plan.limits, null, 2),
    isDefaultVendorPlan: plan.isDefaultVendorPlan,
    isActive: plan.isActive,
  };
}

export default function SubscriptionPlans() {
  const { fetchPlans, createPlan, updatePlan, deletePlan, loading, error } = useAdminSubscriptions();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    const { items } = await fetchPlans({ page: "1", limit: "100" });
    setPlans(items);
  }, [fetchPlans]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(plan: SubscriptionPlan) {
    setEditing(plan);
    setForm(planToForm(plan));
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { payload, error: parseError } = parsePlanForm(form);
    if (!payload) {
      setFormError(parseError || "Invalid form");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    const result = editing ? await updatePlan(editing.id, payload) : await createPlan(payload);
    setSubmitting(false);

    if (!result) return;

    setShowForm(false);
    await loadPlans();
  }

  async function handleToggleActive(plan: SubscriptionPlan) {
    setActionId(plan.id);
    const updated = await updatePlan(plan.id, { isActive: !plan.isActive });
    setActionId(null);
    if (updated) await loadPlans();
  }

  async function handleDelete(plan: SubscriptionPlan) {
    if (!window.confirm(`Delete plan "${plan.name}"? This only works if no vendor ever used it.`)) {
      return;
    }
    setActionId(plan.id);
    const ok = await deletePlan(plan.id);
    setActionId(null);
    if (ok) await loadPlans();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subscription Plans</h1>
        <p className="page-subtitle">Manage the plan catalog vendors can subscribe to</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Plans</div>
            <div className="inv-toolbar-sub">
              {loading && plans.length === 0 ? "Loading..." : `${plans.length} plans`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <button className="inv-btn-create" onClick={openCreate}>
              <span className="inv-btn-create-icon">+</span> Add Plan
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Default</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted">
                  {loading ? "Loading plans..." : "No plans yet."}
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="fw-medium">{plan.name}</td>
                  <td>{plan.price > 0 ? formatMoney(plan.price, plan.currency) : "Free"}</td>
                  <td>{planDurationLabel(plan)}</td>
                  <td>
                    {plan.isDefaultVendorPlan ? (
                      <span className="badge badge-info">Default</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {plan.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-default">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-sm">
                      <button className="inv-action-btn" onClick={() => openEdit(plan)}>
                        Edit
                      </button>
                      <button
                        className="inv-action-btn inv-action-btn-warning"
                        disabled={actionId === plan.id}
                        onClick={() => handleToggleActive(plan)}
                      >
                        {plan.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        className="inv-action-btn inv-action-btn-danger"
                        disabled={actionId === plan.id}
                        onClick={() => handleDelete(plan)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="inv-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div className="inv-modal-header-left">
                <div className="inv-modal-title">{editing ? `Edit Plan — ${editing.name}` : "Add Plan"}</div>
              </div>
              <button className="inv-modal-close" onClick={() => setShowForm(false)}>
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
                    Name
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      required
                    />
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <label>
                      Price
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                        required
                      />
                    </label>
                    <label>
                      Currency
                      <input
                        value={form.currency}
                        onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                        required
                      />
                    </label>
                    <label>
                      Duration (days)
                      <input
                        type="number"
                        min="1"
                        value={form.durationDays}
                        onChange={(e) => setForm((p) => ({ ...p, durationDays: e.target.value }))}
                        required
                      />
                    </label>
                  </div>
                  <label>
                    Features (JSON — true/false flags)
                    <textarea
                      rows={5}
                      style={{ fontFamily: "monospace", fontSize: "13px" }}
                      value={form.features}
                      onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
                    />
                  </label>
                  <label>
                    Limits (JSON — numeric quotas)
                    <textarea
                      rows={5}
                      style={{ fontFamily: "monospace", fontSize: "13px" }}
                      value={form.limits}
                      onChange={(e) => setForm((p) => ({ ...p, limits: e.target.value }))}
                    />
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={form.isDefaultVendorPlan}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, isDefaultVendorPlan: e.target.checked }))
                      }
                    />
                    Default vendor plan (auto-assigned at registration; only one plan can be default)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                    />
                    Active (visible to vendors)
                  </label>
                </div>
              </div>
              <div className="inv-modal-footer">
                <button type="button" className="inv-btn-cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="inv-btn-submit" disabled={submitting}>
                  {submitting ? "Saving..." : editing ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
