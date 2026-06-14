import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  HiCurrencyDollar,
  HiBuildingOffice,
  HiClock,
  HiCreditCard,
  HiArrowUp,
  HiArrowDown,
  HiArrowsUpDown,
  HiXMark,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { usePayments } from "../../../hooks/usePayments";
import { useBookings } from "../../../hooks/useBookings";
import { useAuthContext } from "../../../contexts/AuthContext";
import { enrichBookings } from "../../../api/bookingHelpers";
import {
  formatTransactionDate,
  formatWalletAmount,
  transactionDisplayType,
  transactionSignedAmount,
  V1_WALLET_NOTICE,
  walletStats,
} from "../../../api/walletHelpers";
import type { EnrichedBooking, Wallet, WalletTransaction } from "../../../types/api.types";
import "../styles/provider.css";

export default function Earnings() {
  const { user } = useAuthContext();
  const { fetchWallet, fetchTransactions, withdraw, loading, error } = usePayments();
  const { fetchProviderBookings } = useBookings();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", method: "mpesa", phone: "" });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "amount" | "source">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    const [walletData, txData, bookingRows] = await Promise.all([
      fetchWallet(),
      fetchTransactions(),
      fetchProviderBookings(),
    ]);

    if (walletData) setWallet(walletData);
    setTransactions(txData);
    setBookings(await enrichBookings(bookingRows));
  }, [fetchWallet, fetchTransactions, fetchProviderBookings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (user?.phone) {
      setWithdrawForm((p) => ({ ...p, phone: p.phone || user.phone }));
    }
  }, [user?.phone]);

  const currency = wallet?.currency || "TZS";
  const balance = wallet?.balance ?? 0;
  const stats = useMemo(() => walletStats(transactions), [transactions]);

  const completedBookingTotal = useMemo(
    () => bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.price, 0),
    [bookings]
  );

  const pendingBookingTotal = useMemo(
    () => bookings.filter((b) => b.status === "accepted").reduce((sum, b) => sum + b.price, 0),
    [bookings]
  );

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        t.id.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.reference || "").toLowerCase().includes(q);
      const matchType = typeFilter === "all" || t.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [transactions, search, typeFilter]);

  const sorted = useMemo(() => {
    const items = [...filtered];
    return items.sort((a, b) => {
      if (sortField === "amount") {
        return sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      const valA = sortField === "date" ? a.createdAt : a.description || "";
      const valB = sortField === "date" ? b.createdAt : b.description || "";
      return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [filtered, sortField, sortDir]);

  const handleSort = (field: "date" | "amount" | "source") => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

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
    await loadData();
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <HiArrowsUpDown className="sort-icon-inactive" />;
    return sortDir === "asc" ? <HiArrowUp className="sort-icon-active" /> : <HiArrowDown className="sort-icon-active" />;
  };

  return (
    <main className="customer-page">
      <div className="customer-page-header">
        <h1 className="customer-page-title">Earnings</h1>
        <p className="customer-page-subtitle">Wallet balance and payout history</p>
      </div>

      <p className="profile-member-since" style={{ marginBottom: 16 }}>{V1_WALLET_NOTICE}</p>
      {error && <p className="listings-count-text" style={{ color: "#b42318" }}>{error}</p>}

      <div className="dashboard-grid">
        <div className="dash-stat-card dash-stat-green">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-green">
              <HiCurrencyDollar />
            </div>
            <div>
              <p className="dash-stat-label">Total Credited</p>
              <p className="dash-stat-value dash-stat-value-green">
                {formatWalletAmount(stats.totalDeposits, currency)}
              </p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-neutral">
              Completed bookings ref: {formatWalletAmount(completedBookingTotal, currency)}
            </span>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-gold">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-gold">
              <HiBuildingOffice />
            </div>
            <div>
              <p className="dash-stat-label">Available Balance</p>
              <p className="dash-stat-value dash-stat-value-gold">
                {loading && !wallet ? "Loading..." : formatWalletAmount(balance, currency)}
              </p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-neutral">Ready for withdrawal</span>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-amber">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-amber">
              <HiClock />
            </div>
            <div>
              <p className="dash-stat-label">Accepted Bookings (unsettled)</p>
              <p className="dash-stat-value dash-stat-value-amber">
                {formatWalletAmount(pendingBookingTotal, currency)}
              </p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-warning">
              {bookings.filter((b) => b.status === "accepted").length} active bookings
            </span>
          </div>
        </div>
      </div>

      <div className="earnings-action-card">
        <div className="earnings-action-left">
          <div className="earnings-action-icon-wrap">
            <HiCreditCard className="earnings-action-icon-svg" />
          </div>
          <div>
            <p className="earnings-action-title">Ready to withdraw?</p>
            <p className="earnings-action-subtitle">Withdraw from your wallet balance (simulated in V1)</p>
          </div>
        </div>
        <div className="earnings-action-buttons">
          <button className="btn-withdraw" onClick={() => setShowWithdraw(true)}>Withdraw Funds</button>
        </div>
      </div>

      {showWithdraw && (
        <div className="provider-modal-backdrop" onClick={() => setShowWithdraw(false)}>
          <div className="provider-modal" onClick={(e) => e.stopPropagation()}>
            <div className="provider-modal-header">
              <div className="provider-modal-header-left">
                <div className="provider-modal-icon-wrap provider-modal-icon-withdraw">
                  <HiCurrencyDollar />
                </div>
                <div>
                  <h3 className="provider-modal-title">Withdraw Earnings</h3>
                  <p className="provider-modal-subtitle">Available: {formatWalletAmount(balance, currency)}</p>
                </div>
              </div>
              <button className="provider-modal-close" onClick={() => setShowWithdraw(false)}>
                <HiXMark />
              </button>
            </div>
            <form onSubmit={handleWithdraw}>
              <div className="provider-modal-body">
                <div className="provider-form-grid">
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
              <div className="provider-modal-footer">
                <button type="button" className="btn-report" onClick={() => setShowWithdraw(false)}>Cancel</button>
                <button type="submit" className="btn-withdraw" disabled={submitting}>
                  {submitting ? "Processing..." : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Wallet Transactions</h2>
            <p className="dash-section-subtitle">{sorted.length} transactions</p>
          </div>
        </div>

        <div className="table-card">
          <div className="earnings-table-toolbar">
            <div className="table-search-wrap earnings-search-wrap">
              <HiMagnifyingGlass className="table-search-icon" />
              <input
                className="table-search-input"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="earnings-toolbar-right">
              <span className="table-toolbar-count">{sorted.length} records</span>
              <select
                className="input-select table-filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table data-table-earnings">
              <thead>
                <tr>
                  <th className="col-status" onClick={() => handleSort("source")}>
                    <span>Description</span><SortIcon field="source" />
                  </th>
                  <th className="col-status" onClick={() => handleSort("amount")}>
                    <span>Amount</span><SortIcon field="amount" />
                  </th>
                  <th className="col-status" onClick={() => handleSort("date")}>
                    <span>Date</span><SortIcon field="date" />
                  </th>
                  <th className="col-status">
                    <span>Type</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => {
                  const signed = transactionSignedAmount(t);
                  return (
                    <tr key={t.id}>
                      <td className="td-priority" data-label="Description">
                        <span className="td-source-text">{t.description || "Wallet transaction"}</span>
                      </td>
                      <td className={`td-priority ${signed >= 0 ? "td-amount-positive" : ""}`} data-label="Amount">
                        {signed >= 0 ? "+" : "−"} {formatWalletAmount(Math.abs(signed), currency)}
                      </td>
                      <td className="td-secondary" data-label="Date">
                        <span className="td-date-text">{formatTransactionDate(t.createdAt)}</span>
                      </td>
                      <td className="td-secondary" data-label="Type">
                        <span className="badge badge-info">{transactionDisplayType(t.type)}</span>
                      </td>
                    </tr>
                  );
                })}
                {!loading && sorted.length === 0 && (
                  <tr>
                    <td colSpan={4} className="table-empty-cell">
                      <div className="table-empty-state">
                        <HiMagnifyingGlass className="table-empty-icon" />
                        <p>No wallet transactions yet</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
