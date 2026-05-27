import { useState } from "react";
import { HiSearch, HiArrowDown, HiArrowUp, HiX } from "react-icons/hi";
import "../styles/customer.css";

const transactions = [
  { id: "TXN-001", type: "deposit", amount: 200000, method: "mpesa", date: "2026-05-20", status: "completed" },
  { id: "TXN-002", type: "payment", amount: -120000, method: "wallet", date: "2026-05-19", status: "completed" },
  { id: "TXN-003", type: "deposit", amount: 100000, method: "tigopesa", date: "2026-05-18", status: "completed" },
  { id: "TXN-004", type: "refund", amount: 45000, method: "wallet", date: "2026-05-17", status: "completed" },
  { id: "TXN-005", type: "withdrawal", amount: -50000, method: "bank", date: "2026-05-15", status: "pending" },
  { id: "TXN-006", type: "deposit", amount: 150000, method: "airtelmoney", date: "2026-05-14", status: "completed" },
  { id: "TXN-007", type: "payment", amount: -350000, method: "wallet", date: "2026-05-12", status: "completed" },
];

export default function Wallet() {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: "", method: "mpesa", phone: "" });
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", method: "mpesa", phone: "" });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalDeposits = transactions.filter(t => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
  const totalSpent = Math.abs(transactions.filter(t => t.type === "payment" || t.type === "withdrawal").reduce((s, t) => s + t.amount, 0));

  const filtered = transactions.filter(t => {
    const matchSearch = t.id.toLowerCase().includes(search.toLowerCase()) || t.method.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <main className="customer-page">
      <div className="customer-page-header">
        <div>
          <h1 className="customer-page-title">Wallet</h1>
          <p className="customer-page-subtitle">Manage your payments and balance</p>
        </div>
      </div>

      <div className="wallet-premium-card">
        <div className="wallet-card-inner">
          <p className="wallet-balance-label">Available Balance</p>
          <h1 className="wallet-balance-value">TZS {balance.toLocaleString()}</h1>

          <div className="wallet-quick-stats">
            <div className="wallet-stat-item">
              <p className="wallet-stat-value">TZS {totalDeposits.toLocaleString()}</p>
              <p className="wallet-stat-label">Total Deposited</p>
            </div>
            <div className="wallet-stat-item">
              <p className="wallet-stat-value">TZS {totalSpent.toLocaleString()}</p>
              <p className="wallet-stat-label">Total Spent</p>
            </div>
            <div className="wallet-stat-item">
              <p className="wallet-stat-value">{transactions.length}</p>
              <p className="wallet-stat-label">Transactions</p>
            </div>
          </div>

          <div className="wallet-actions">
            <button className="wallet-action-btn wallet-deposit-btn" onClick={() => { setShowDeposit(true); setShowWithdraw(false); }}>
              <HiArrowDown className="wallet-btn-icon" />
              <span>Deposit</span>
            </button>
            <button className="wallet-action-btn wallet-withdraw-btn" onClick={() => { setShowWithdraw(true); setShowDeposit(false); }}>
              <HiArrowUp className="wallet-btn-icon" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="wallet-modal-backdrop" onClick={() => setShowDeposit(false)}>
          <div className="wallet-modal" onClick={e => e.stopPropagation()}>
            <div className="wallet-modal-header">
              <div className="wallet-modal-header-left">
                <div className="wallet-modal-icon-wrap wallet-modal-icon-deposit">
                  <HiArrowDown />
                </div>
                <div>
                  <div className="wallet-modal-title">Deposit Funds</div>
                  <div className="wallet-modal-subtitle">Add money to your wallet</div>
                </div>
              </div>
              <button className="wallet-modal-close" onClick={() => setShowDeposit(false)}>
                <HiX />
              </button>
            </div>
            <div className="wallet-modal-body">
              <div className="wallet-form-grid">
                <div>
                  <label className="label label-required">Amount (TZS)</label>
                  <input className="input-text" type="number" placeholder="Enter amount" value={depositForm.amount} onChange={e => setDepositForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="label label-required">Payment Method</label>
                  <select className="input-select" value={depositForm.method} onChange={e => setDepositForm(p => ({ ...p, method: e.target.value }))}>
                    <option value="mpesa">M-Pesa</option>
                    <option value="tigopesa">Tigo Pesa</option>
                    <option value="airtelmoney">Airtel Money</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="label label-required">Phone Number</label>
                  <input className="input-text" type="tel" placeholder="+255 7XX XXX XXX" value={depositForm.phone} onChange={e => setDepositForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="wallet-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowDeposit(false)}>Cancel</button>
              <button className="inv-btn-submit" onClick={() => { alert("Deposit request sent!"); setShowDeposit(false); }}>Confirm Deposit</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="wallet-modal-backdrop" onClick={() => setShowWithdraw(false)}>
          <div className="wallet-modal" onClick={e => e.stopPropagation()}>
            <div className="wallet-modal-header">
              <div className="wallet-modal-header-left">
                <div className="wallet-modal-icon-wrap wallet-modal-icon-withdraw">
                  <HiArrowUp />
                </div>
                <div>
                  <div className="wallet-modal-title">Withdraw Funds</div>
                  <div className="wallet-modal-subtitle">Available: TZS {balance.toLocaleString()}</div>
                </div>
              </div>
              <button className="wallet-modal-close" onClick={() => setShowWithdraw(false)}>
                <HiX />
              </button>
            </div>
            <div className="wallet-modal-body">
              <div className="wallet-form-grid">
                <div>
                  <label className="label label-required">Amount (TZS)</label>
                  <input className="input-text" type="number" placeholder="Enter amount" value={withdrawForm.amount} onChange={e => setWithdrawForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="label label-required">Withdraw To</label>
                  <select className="input-select" value={withdrawForm.method} onChange={e => setWithdrawForm(p => ({ ...p, method: e.target.value }))}>
                    <option value="mpesa">M-Pesa</option>
                    <option value="tigopesa">Tigo Pesa</option>
                    <option value="airtelmoney">Airtel Money</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>
                <div>
                  <label className="label label-required">Phone / Account Number</label>
                  <input className="input-text" type="text" placeholder="Enter number" value={withdrawForm.phone} onChange={e => setWithdrawForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="wallet-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowWithdraw(false)}>Cancel</button>
              <button className="inv-btn-submit" onClick={() => { alert("Withdrawal request sent!"); setShowWithdraw(false); }}>Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <section className="dash-section">
        <div className="dash-section-header dash-section-header-responsive">
          <div>
            <h2 className="dash-section-title">Transaction History</h2>
            <p className="dash-section-subtitle">{filtered.length} transactions</p>
          </div>
          <div className="wallet-filter-row">
            <div className="customer-search-wrap wallet-search-wrap">
              <HiSearch className="customer-search-icon" />
              <input className="customer-search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-select wallet-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>
        </div>

        {/* Responsive: Table on desktop, Cards on mobile */}
        <div className="wallet-table-desktop">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Type</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map(txn => (
                  <tr key={txn.id}>
                    <td className="fw-medium">{txn.id}</td>
                    <td><span className="badge badge-info">{txn.type}</span></td>
                    <td className={txn.amount > 0 ? "stat-change-positive fw-semibold" : "stat-change-negative fw-semibold"}>
                      {txn.amount > 0 ? "+" : ""}TZS {Math.abs(txn.amount).toLocaleString()}
                    </td>
                    <td><span className="badge badge-default">{txn.method}</span></td>
                    <td className="text-sm">{txn.date}</td>
                    <td>
                      {txn.status === "completed" ? <span className="badge badge-success">● Completed</span> : <span className="badge badge-warning">○ Pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="wallet-cards-mobile">
          {filtered.map(txn => (
            <div key={txn.id} className="wallet-txn-card">
              <div className="wallet-txn-card-top">
                <span className="fw-medium">{txn.id}</span>
                <span className={`wallet-txn-amount ${txn.amount > 0 ? "stat-change-positive" : "stat-change-negative"}`}>
                  {txn.amount > 0 ? "+" : ""}TZS {Math.abs(txn.amount).toLocaleString()}
                </span>
              </div>
              <div className="wallet-txn-card-bottom">
                <span className="badge badge-info">{txn.type}</span>
                <span className="badge badge-default">{txn.method}</span>
                <span className="text-sm text-muted">{txn.date}</span>
                <span>{txn.status === "completed" ? <span className="badge badge-success">● Completed</span> : <span className="badge badge-warning">○ Pending</span>}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
