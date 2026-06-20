import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { formatAdminDate } from "../../../api/adminHelpers";
import type { AdminPayment, AdminTransaction } from "../../../types/api.types";

export default function Payments() {
  const { fetchPayments, fetchTransactions, loading, error } = useAdmin();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    const params: Record<string, string> = { page: "1", limit: "100" };
    if (statusFilter !== "all") params.status = statusFilter;

    const [paymentsResult, transactionsResult] = await Promise.all([
      fetchPayments(params),
      fetchTransactions({ page: "1", limit: "50" }),
    ]);

    setPayments(paymentsResult.items);
    setTransactions(transactionsResult.items);
  }, [fetchPayments, fetchTransactions, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter(
      (p) =>
        (p.customerName || "").toLowerCase().includes(q) ||
        p.bookingId.toLowerCase().includes(q) ||
        (p.providerName || "").toLowerCase().includes(q)
    );
  }, [payments, search]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payments & Transactions</h1>
        <p className="page-subtitle">Monitor all payment transactions</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Payments</div>
            <div className="inv-toolbar-sub">
              {loading && payments.length === 0 ? "Loading..." : `${filtered.length} payments`}
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <div className="inv-search-wrap">
              <input
                className="inv-search"
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Booking</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-muted">
                  {loading ? "Loading payments..." : "No payments found."}
                </td>
              </tr>
            ) : (
              filtered.map((payment) => (
                <tr key={payment.id}>
                  <td className="fw-medium">{payment.id}</td>
                  <td>{payment.bookingId}</td>
                  <td>{payment.customerName || "—"}</td>
                  <td>{payment.providerName || "—"}</td>
                  <td>TZS {payment.amount.toLocaleString()}</td>
                  <td><span className="badge badge-default">{payment.method || "—"}</span></td>
                  <td>
                    {payment.status === "completed" && <span className="badge badge-success">Completed</span>}
                    {payment.status === "pending" && <span className="badge badge-warning">Pending</span>}
                    {payment.status === "failed" && <span className="badge badge-danger">Failed</span>}
                    {payment.status === "refunded" && <span className="badge badge-info">Refunded</span>}
                  </td>
                  <td>{formatAdminDate(payment.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-container" style={{ marginTop: "24px" }}>
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Wallet Transactions</div>
            <div className="inv-toolbar-sub">{transactions.length} transactions</div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted">No wallet transactions yet.</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="fw-medium">{tx.id}</td>
                  <td>{tx.userName || tx.userUsername}</td>
                  <td>
                    <span className={`badge ${tx.type === "credit" ? "badge-success" : "badge-warning"}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td>TZS {tx.amount.toLocaleString()}</td>
                  <td className="text-muted">{tx.description || "—"}</td>
                  <td>{formatAdminDate(tx.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
