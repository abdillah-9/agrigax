import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { HiSearch, HiArrowDown, HiArrowUp, HiX } from "react-icons/hi";
import { usePayments } from "../../../hooks/usePayments";
import { useAuthContext } from "../../../contexts/AuthContext";
import {
  formatTransactionDate,
  formatWalletAmount,
  transactionDisplayType,
  transactionSignedAmount,
  V1_WALLET_NOTICE,
  walletStats,
} from "../../../api/walletHelpers";
import type { Wallet, WalletTransaction } from "../../../types/api.types";
import "../styles/customer.css";

export default function Wallet() {
  const { user } = useAuthContext();
  const { fetchWallet, fetchTransactions, deposit, withdraw, loading, error } = usePayments();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: "", method: "mpesa", phone: "" });
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", method: "mpesa", phone: "" });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const loadWalletData = useCallback(async () => {
    const [walletData, txData] = await Promise.all([fetchWallet(), fetchTransactions()]);
    if (walletData) setWallet(walletData);
    setTransactions(txData);
  }, [fetchWallet, fetchTransactions]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  useEffect(() => {
    if (user?.phone) {
      setDepositForm((p) => ({ ...p, phone: p.phone || user.phone }));
      setWithdrawForm((p) => ({ ...p, phone: p.phone || user.phone }));
    }
  }, [user?.phone]);

  const stats = useMemo(() => walletStats(transactions), [transactions]);
  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency || "TZS";

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const displayType = transactionDisplayType(t.type);
      const q = search.toLowerCase();
      const matchSearch =
        t.id.toLowerCase().includes(q) ||
        (t.reference || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        displayType.includes(q);
      const matchType = typeFilter === "all" || t.type === typeFilter || displayType === typeFilter;
      return matchSearch && matchType;
    });
  }, [transactions, search, typeFilter]);

  async function handleDeposit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await deposit({
      amount: Number(depositForm.amount),
      method: depositForm.method,
      phone: depositForm.phone.trim(),
    });
    setSubmitting(false);
    if (!result) return;

    setShowDeposit(false);
    setDepositForm((p) => ({ ...p, amount: "" }));
    await loadWalletData();
  }

  async function handleWithdraw(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await withdraw({
      amount: Number(withdrawForm.amount),
      method: withdrawForm.method,
      phone: withdrawForm.phone.trim(),
    });
    setSubmitting(false);
    if (!result) return;

    setShowWithdraw(false);
    setWithdrawForm((p) => ({ ...p, amount: "" }));
    await loadWalletData();
  }

  return (
    <main className="customer-page">
      <div className="customer-page-header">
        <div>
          <h1 className="customer-page-title">Wallet</h1>
          <p className="customer-page-subtitle">Manage your payments and balance</p>
        </div>
      </div>

      <p className="profile-member-since" style={{ marginBottom: 16 }}>{V1_WALLET_NOTICE}</p>
      {error && <p className="listings-count-text" style={{ color: "#b42318" }}>{error}</p>}

      <div className="wallet-premium-card">
        <div className="wallet-card-inner">
          <p className="wallet-balance-label">Available Balance</p>
          <h1 className="wallet-balance-value">
            {loading && !wallet ? "Loading..." : formatWalletAmount(balance, currency)}
          </h1>

          <div className="wallet-quick-stats">
            <div className="wallet-stat-item">
              <p className="wallet-stat-value">{formatWalletAmount(stats.totalDeposits, currency)}</p>
              <p className="wallet-stat-label">Total Deposited</p>
            </div>
            <div className="wallet-stat-item">
              <p className="wallet-stat-value">{formatWalletAmount(stats.totalWithdrawals, currency)}</p>
              <p className="wallet-stat-label">Total Withdrawn</p>
            </div>
            <div className="wallet-stat-item">
              <p className="wallet-stat-value">{stats.transactionCount}</p>
              <p className="wallet-stat-label">Transactions</p>
            </div>
          </div>

          <div className="wallet-actions">
            <button
              className="wallet-action-btn wallet-deposit-btn"
              onClick={() => { setShowDeposit(true); setShowWithdraw(false); }}
            >
              <HiArrowDown className="wallet-btn-icon" />
              <span>Deposit</span>
            </button>
            <button
              className="wallet-action-btn wallet-withdraw-btn"
              onClick={() => { setShowWithdraw(true); setShowDeposit(false); }}
            >
              <HiArrowUp className="wallet-btn-icon" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {showDeposit && (
        <div className="wallet-modal-backdrop" onClick={() => setShowDeposit(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wallet-modal-header">
              <div className="wallet-modal-header-left">
                <div className="wallet-modal-icon-wrap wallet-modal-icon-deposit">
                  <HiArrowDown />
                </div>
                <div>
                  <div className="wallet-modal-title">Deposit Funds</div>
                  <div className="wallet-modal-subtitle">Simulated deposit (V1)</div>
                </div>
              </div>
              <button className="wallet-modal-close" onClick={() => setShowDeposit(false)}>
                <HiX />
              </button>
            </div>
            <form onSubmit={handleDeposit}>
              <div className="wallet-modal-body">
                <div className="wallet-form-grid">
                  <div>
                    <label className="label label-required">Amount (TZS)</label>
                    <input
                      className="input-text"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Enter amount"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm((p) => ({ ...p, amount: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label label-required">Payment Method</label>
                    <select
                      className="input-select"
                      value={depositForm.method}
                      onChange={(e) => setDepositForm((p) => ({ ...p, method: e.target.value }))}
                    >
                      <option value="mpesa">M-Pesa</option>
                      <option value="tigopesa">Tigo Pesa</option>
                      <option value="airtelmoney">Airtel Money</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="label label-required">Phone Number</label>
                    <input
                      className="input-text"
                      type="tel"
                      placeholder="+2557XXXXXXXX"
                      value={depositForm.phone}
                      onChange={(e) => setDepositForm((p) => ({ ...p, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="wallet-modal-footer">
                <button type="button" className="inv-btn-cancel" onClick={() => setShowDeposit(false)}>
                  Cancel
                </button>
                <button type="submit" className="inv-btn-submit" disabled={submitting}>
                  {submitting ? "Processing..." : "Confirm Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="wallet-modal-backdrop" onClick={() => setShowWithdraw(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wallet-modal-header">
              <div className="wallet-modal-header-left">
                <div className="wallet-modal-icon-wrap wallet-modal-icon-withdraw">
                  <HiArrowUp />
                </div>
                <div>
                  <div className="wallet-modal-title">Withdraw Funds</div>
                  <div className="wallet-modal-subtitle">Available: {formatWalletAmount(balance, currency)}</div>
                </div>
              </div>
              <button className="wallet-modal-close" onClick={() => setShowWithdraw(false)}>
                <HiX />
              </button>
            </div>
            <form onSubmit={handleWithdraw}>
              <div className="wallet-modal-body">
                <div className="wallet-form-grid">
                  <div>
                    <label className="label label-required">Amount (TZS)</label>
                    <input
                      className="input-text"
                      type="number"
                      min="1"
                      step="0.01"
                      max={balance}
                      placeholder="Enter amount"
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm((p) => ({ ...p, amount: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label label-required">Withdraw To</label>
                    <select
                      className="input-select"
                      value={withdrawForm.method}
                      onChange={(e) => setWithdrawForm((p) => ({ ...p, method: e.target.value }))}
                    >
                      <option value="mpesa">M-Pesa</option>
                      <option value="tigopesa">Tigo Pesa</option>
                      <option value="airtelmoney">Airtel Money</option>
                      <option value="bank">Bank Account</option>
                    </select>
                  </div>
                  <div>
                    <label className="label label-required">Phone / Account Number</label>
                    <input
                      className="input-text"
                      type="text"
                      placeholder="Enter number"
                      value={withdrawForm.phone}
                      onChange={(e) => setWithdrawForm((p) => ({ ...p, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="wallet-modal-footer">
                <button type="button" className="inv-btn-cancel" onClick={() => setShowWithdraw(false)}>
                  Cancel
                </button>
                <button type="submit" className="inv-btn-submit" disabled={submitting}>
                  {submitting ? "Processing..." : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="dash-section">
        <div className="dash-section-header dash-section-header-responsive">
          <div>
            <h2 className="dash-section-title">Transaction History</h2>
            <p className="dash-section-subtitle">{filtered.length} transactions</p>
          </div>
          <div className="wallet-filter-row">
            <div className="customer-search-wrap wallet-search-wrap">
              <HiSearch className="customer-search-icon" />
              <input
                className="customer-search-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input-select wallet-filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="credit">Deposits</option>
              <option value="debit">Withdrawals</option>
            </select>
          </div>
        </div>

        <div className="wallet-table-desktop">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Type</th><th>Amount</th><th>Reference</th><th>Date</th><th>Description</th></tr>
              </thead>
              <tbody>
                {filtered.map((txn) => {
                  const signed = transactionSignedAmount(txn);
                  return (
                    <tr key={txn.id}>
                      <td className="fw-medium">#{txn.id}</td>
                      <td><span className="badge badge-info">{transactionDisplayType(txn.type)}</span></td>
                      <td className={signed >= 0 ? "stat-change-positive fw-semibold" : "stat-change-negative fw-semibold"}>
                        {signed >= 0 ? "+" : ""}{formatWalletAmount(Math.abs(signed), currency)}
                      </td>
                      <td><span className="badge badge-default">{txn.reference || "—"}</span></td>
                      <td className="text-sm">{formatTransactionDate(txn.createdAt)}</td>
                      <td className="text-sm">{txn.description || "—"}</td>
                    </tr>
                  );
                })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="table-empty"><p>No transactions yet.</p></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="wallet-cards-mobile">
          {filtered.map((txn) => {
            const signed = transactionSignedAmount(txn);
            return (
              <div key={txn.id} className="wallet-txn-card">
                <div className="wallet-txn-card-top">
                  <span className="fw-medium">#{txn.id}</span>
                  <span className={`wallet-txn-amount ${signed >= 0 ? "stat-change-positive" : "stat-change-negative"}`}>
                    {signed >= 0 ? "+" : ""}{formatWalletAmount(Math.abs(signed), currency)}
                  </span>
                </div>
                <div className="wallet-txn-card-bottom">
                  <span className="badge badge-info">{transactionDisplayType(txn.type)}</span>
                  <span className="badge badge-default">{txn.reference || "—"}</span>
                  <span className="text-sm text-muted">{formatTransactionDate(txn.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
