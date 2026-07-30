import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdminSubscriptions } from "../../../hooks/useAdminSubscriptions";
import { humanizeKey, paymentMethodSummary } from "../../../api/subscriptionHelpers";
import type { PaymentMethod, PaymentMethodType } from "../../../types/api.types";
import "../../subscriptions/styles/subscriptions.css";

const emptyForm = {
  name: "",
  type: "mobile_money" as PaymentMethodType,
  accountName: "",
  accountNumber: "",
  phoneNumber: "",
  instructions: "",
  displayOrder: "0",
  isActive: true,
};

type MethodForm = typeof emptyForm;

function methodToForm(method: PaymentMethod): MethodForm {
  return {
    name: method.name,
    type: method.type,
    accountName: method.accountName || "",
    accountNumber: method.accountNumber || "",
    phoneNumber: method.phoneNumber || "",
    instructions: method.instructions || "",
    displayOrder: String(method.displayOrder),
    isActive: method.isActive,
  };
}

export default function PaymentMethods() {
  const { fetchPaymentMethods, createPaymentMethod, updatePaymentMethod, loading, error } =
    useAdminSubscriptions();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MethodForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadMethods = useCallback(async () => {
    const { items } = await fetchPaymentMethods({ page: "1", limit: "100" });
    setMethods(items);
  }, [fetchPaymentMethods]);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(method: PaymentMethod) {
    setEditing(method);
    setForm(methodToForm(method));
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      type: form.type,
      accountName: form.accountName.trim(),
      accountNumber: form.accountNumber.trim(),
      phoneNumber: form.phoneNumber.trim(),
      instructions: form.instructions.trim(),
      displayOrder: Number(form.displayOrder) || 0,
      isActive: form.isActive,
    };

    setSubmitting(true);
    const result = editing
      ? await updatePaymentMethod(editing.id, payload)
      : await createPaymentMethod(payload);
    setSubmitting(false);

    if (!result) return;

    setShowForm(false);
    await loadMethods();
  }

  async function handleToggleActive(method: PaymentMethod) {
    setActionId(method.id);
    const updated = await updatePaymentMethod(method.id, { isActive: !method.isActive });
    setActionId(null);
    if (updated) await loadMethods();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payment Methods</h1>
        <p className="page-subtitle">
          The off-platform payment instructions vendors see when upgrading their plan
        </p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Payment Methods</div>
            <div className="inv-toolbar-sub">
              {loading && methods.length === 0 ? "Loading..." : `${methods.length} methods`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <button className="inv-btn-create" onClick={openCreate}>
              <span className="inv-btn-create-icon">+</span> Add Method
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Details</th>
              <th>Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {methods.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted">
                  {loading ? "Loading payment methods..." : "No payment methods yet."}
                </td>
              </tr>
            ) : (
              methods.map((method) => (
                <tr key={method.id}>
                  <td className="fw-medium">{method.name}</td>
                  <td>
                    <span className="badge badge-default">{humanizeKey(method.type)}</span>
                  </td>
                  <td className="text-muted">{paymentMethodSummary(method)}</td>
                  <td>{method.displayOrder}</td>
                  <td>
                    {method.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-default">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-sm">
                      <button className="inv-action-btn" onClick={() => openEdit(method)}>
                        Edit
                      </button>
                      <button
                        className="inv-action-btn inv-action-btn-warning"
                        disabled={actionId === method.id}
                        onClick={() => handleToggleActive(method)}
                      >
                        {method.isActive ? "Disable" : "Enable"}
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
                <div className="inv-modal-title">
                  {editing ? `Edit Method — ${editing.name}` : "Add Payment Method"}
                </div>
              </div>
              <button className="inv-modal-close" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="inv-modal-body">
                <div className="sub-form-grid">
                  <label>
                    Name
                    <input
                      placeholder="e.g. M-Pesa, CRDB Bank Transfer"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Type
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, type: e.target.value as PaymentMethodType }))
                      }
                    >
                      <option value="mobile_money">Mobile Money</option>
                      <option value="bank_account">Bank Account</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  {form.type === "mobile_money" && (
                    <label>
                      Phone number
                      <input
                        placeholder="e.g. +255 7XX XXX XXX"
                        value={form.phoneNumber}
                        onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                      />
                    </label>
                  )}
                  {form.type === "bank_account" && (
                    <>
                      <label>
                        Account name
                        <input
                          value={form.accountName}
                          onChange={(e) => setForm((p) => ({ ...p, accountName: e.target.value }))}
                        />
                      </label>
                      <label>
                        Account number
                        <input
                          value={form.accountNumber}
                          onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                        />
                      </label>
                    </>
                  )}
                  <label>
                    Instructions (optional)
                    <textarea
                      rows={3}
                      placeholder="Extra guidance shown to vendors"
                      value={form.instructions}
                      onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))}
                    />
                  </label>
                  <label>
                    Display order
                    <input
                      type="number"
                      min="0"
                      value={form.displayOrder}
                      onChange={(e) => setForm((p) => ({ ...p, displayOrder: e.target.value }))}
                    />
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
                  {submitting ? "Saving..." : editing ? "Save Changes" : "Create Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
