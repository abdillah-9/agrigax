import { useState } from "react";
import "../customer.css";

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
    <main className="p-xl">
      <div className="mb-xl">
        <h1 className="text-2xl fw-bold neutral-dark">Wallet</h1>
        <p className="text-sm text-muted mt-xs">Manage your payments and balance</p>
      </div>

      <div className="wallet-premium-card">
        <div style={{ position: "relative", zIndex: 1 }}>
          <p className="wallet-balance-label mb-sm">Available Balance</p>
          <h1 className="wallet-balance-value">TZS {balance.toLocaleString()}</h1>

          <div className="wallet-quick-stats mt-xl">
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

          <div className="flex gap-md mt-xl">
            <button className="wallet-action-btn wallet-deposit-btn" onClick={() => { setShowDeposit(true); setShowWithdraw(false); }}>
              💰 Deposit
            </button>
            <button className="wallet-action-btn wallet-withdraw-btn" onClick={() => { setShowWithdraw(true); setShowDeposit(false); }}>
              💸 Withdraw
            </button>
          </div>
        </div>
      </div>

      {showDeposit && (
        <div className="inv-modal-backdrop" onClick={() => setShowDeposit(false)}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div className="inv-modal-header-left">
                <span className="inv-modal-icon">💰</span>
                <div>
                  <div className="inv-modal-title">Deposit Funds</div>
                  <div className="inv-modal-subtitle">Add money to your wallet</div>
                </div>
              </div>
              <button className="inv-modal-close" onClick={() => setShowDeposit(false)}>×</button>
            </div>
            <div className="inv-modal-body">
              <div className="form-grid">
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
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowDeposit(false)}>Cancel</button>
              <button className="inv-btn-submit" onClick={() => { alert("Deposit request sent!"); setShowDeposit(false); }}>Confirm Deposit</button>
            </div>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="inv-modal-backdrop" onClick={() => setShowWithdraw(false)}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div className="inv-modal-header-left">
                <span className="inv-modal-icon">💸</span>
                <div>
                  <div className="inv-modal-title">Withdraw Funds</div>
                  <div className="inv-modal-subtitle">Available: TZS {balance.toLocaleString()}</div>
                </div>
              </div>
              <button className="inv-modal-close" onClick={() => setShowWithdraw(false)}>×</button>
            </div>
            <div className="inv-modal-body">
              <div className="form-grid">
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
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowWithdraw(false)}>Cancel</button>
              <button className="inv-btn-submit" onClick={() => { alert("Withdrawal request sent!"); setShowWithdraw(false); }}>Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      )}

      <section className="mt-xl">
        <div className="flex justify-between items-center mb-lg flex-wrap gap-md">
          <div>
            <h2 className="text-lg fw-bold neutral-dark">Transaction History</h2>
            <p className="text-xs text-muted mt-xs">{filtered.length} transactions</p>
          </div>
          <div className="flex gap-sm items-center">
            <div className="inv-search-wrap">
              <input className="inv-search" style={{ width: 180 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-select" style={{ width: "auto" }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>
        </div>

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
      </section>
    </main>
  );
}
