import { useState } from "react";
import "../styles/provider.css";

const earningHistory = [
  { id: "ERN-001", source: "Tractor Rental - BK-001", amount: 120000, date: "2026-05-20", status: "paid" },
  { id: "ERN-002", source: "Seeds Supply - BK-002", amount: 85000, date: "2026-05-19", status: "pending" },
  { id: "ERN-003", source: "Irrigation Setup - BK-003", amount: 320000, date: "2026-05-18", status: "paid" },
  { id: "ERN-004", source: "Soil Testing - BK-004", amount: 45000, date: "2026-05-17", status: "paid" },
  { id: "ERN-005", source: "Harvesting - BK-005", amount: 200000, date: "2026-05-16", status: "pending" },
];

export default function Earnings() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", method: "mpesa", phone: "" });

  const totalEarnings = earningHistory.reduce((sum, e) => sum + e.amount, 0);
  const pendingEarnings = earningHistory.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);
  const availableBalance = totalEarnings - pendingEarnings;

  return (
    <main className="p-xl">
      <div className="mb-xl">
        <h1 className="text-2xl fw-bold neutral-dark">Earnings</h1>
        <p className="text-sm mt-sm">Track your revenue and payouts</p>
      </div>

      <div className="provider-stats-grid">
        <div className="provider-stat-card shadow-md radius-lg">
          <p className="text-sm">Total Earnings</p>
          <h2 className="provider-stat-number">TZS {totalEarnings.toLocaleString()}</h2>
        </div>
        <div className="provider-stat-card shadow-md radius-lg">
          <p className="text-sm">Available Balance</p>
          <h2 className="provider-stat-number">TZS {availableBalance.toLocaleString()}</h2>
        </div>
        <div className="provider-stat-card shadow-md radius-lg">
          <p className="text-sm">Pending</p>
          <h2 className="provider-stat-number">TZS {pendingEarnings.toLocaleString()}</h2>
        </div>
      </div>

      <section className="earnings-card shadow-md radius-lg mt-xl">
        <div className="earnings-actions">
          <button className="provider-primary-btn" onClick={() => setShowWithdraw(true)}>Withdraw Funds</button>
          <button className="provider-outline-btn">Download Report</button>
        </div>
      </section>

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <div className="inv-modal-backdrop" onClick={() => setShowWithdraw(false)}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div className="inv-modal-header-left">
                <span className="inv-modal-icon">💸</span>
                <div>
                  <div className="inv-modal-title">Withdraw Earnings</div>
                  <div className="inv-modal-subtitle">Available: TZS {availableBalance.toLocaleString()}</div>
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
              <button className="inv-btn-submit" onClick={() => { alert("Withdrawal request submitted!"); setShowWithdraw(false); }}>Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      )}

      <section className="mt-xl">
        <h2 className="text-xl fw-bold neutral-dark mb-lg">Earnings History</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Source</th><th>Amount</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {earningHistory.map(e => (
                <tr key={e.id}>
                  <td className="fw-medium">{e.source}</td>
                  <td className="stat-change-positive fw-semibold">TZS {e.amount.toLocaleString()}</td>
                  <td>{e.date}</td>
                  <td>
                    {e.status === "paid" ? <span className="badge badge-success">Paid</span> : <span className="badge badge-warning">Pending</span>}
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
