import { useState } from "react";
import "../styles/provider.css";

const earningHistory = [
  { id: "ERN-001", source: "Tractor Rental - BK-001", amount: 120000, date: "2026-05-20", status: "paid" },
  { id: "ERN-002", source: "Seeds Supply - BK-002", amount: 85000, date: "2026-05-19", status: "pending" },
  { id: "ERN-003", source: "Irrigation Setup - BK-003", amount: 320000, date: "2026-05-18", status: "paid" },
  { id: "ERN-004", source: "Soil Testing - BK-004", amount: 45000, date: "2026-05-17", status: "paid" },
  { id: "ERN-005", source: "Harvesting - BK-005", amount: 200000, date: "2026-05-16", status: "pending" },
  { id: "ERN-006", source: "Fertilizer Supply - BK-006", amount: 65000, date: "2026-05-15", status: "paid" },
  { id: "ERN-007", source: "Dairy Cows - BK-007", amount: 1200000, date: "2026-05-14", status: "paid" },
];

export default function Earnings() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", method: "mpesa", phone: "" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "amount" | "source">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const totalEarnings = earningHistory.reduce((sum, e) => sum + e.amount, 0);
  const pendingEarnings = earningHistory.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);
  const paidEarnings = earningHistory.filter(e => e.status === "paid").reduce((sum, e) => sum + e.amount, 0);

  const filtered = earningHistory.filter(e => {
    const matchSearch = e.source.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSort = (field: "date" | "amount" | "source") => {
    if (sortField === field) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "amount") {
      return sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
    const valA = String(a[sortField]);
    const valB = String(b[sortField]);
    return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const getSortIcon = (field: string) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <main className="p-xl">
      <div className="mb-xl">
        <h1 className="text-2xl fw-bold neutral-dark">Earnings</h1>
        <p className="text-sm text-muted mt-xs">Track your revenue and payouts · May 2026</p>
      </div>

      <div className="provider-stats-grid">
        <div className="earnings-stat-card earnings-stat-card-green">
          <div className="flex items-center gap-md mb-lg">
            <div className="earnings-stat-icon earnings-stat-icon-green">💰</div>
            <div>
              <p className="earnings-stat-label">Total Earnings</p>
              <p className="earnings-stat-value" style={{ color: "#2E7D4F" }}>TZS {totalEarnings.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="badge badge-success text-xs">↑ 18%</span>
            <span className="text-xs text-muted">vs last month</span>
          </div>
        </div>

        <div className="earnings-stat-card earnings-stat-card-gold">
          <div className="flex items-center gap-md mb-lg">
            <div className="earnings-stat-icon earnings-stat-icon-gold">🏦</div>
            <div>
              <p className="earnings-stat-label">Available Balance</p>
              <p className="earnings-stat-value" style={{ color: "#8C7A48" }}>TZS {paidEarnings.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-xs text-muted">Ready for withdrawal</span>
          </div>
        </div>

        <div className="earnings-stat-card earnings-stat-card-amber">
          <div className="flex items-center gap-md mb-lg">
            <div className="earnings-stat-icon earnings-stat-icon-amber">⏳</div>
            <div>
              <p className="earnings-stat-label">Pending Clearance</p>
              <p className="earnings-stat-value" style={{ color: "#9C8B3D" }}>TZS {pendingEarnings.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-xs text-muted">{earningHistory.filter(e => e.status === "pending").length} payments</span>
          </div>
        </div>
      </div>

      <div className="earnings-action-card mt-xl">
        <div className="flex items-center gap-md">
          <div className="earnings-action-icon">💳</div>
          <div>
            <p className="fw-semibold text-sm">Ready to withdraw?</p>
            <p className="text-xs text-muted">Transfer via M-Pesa, Tigo Pesa, Airtel Money or Bank</p>
          </div>
        </div>
        <div className="flex gap-sm">
          <button className="btn-withdraw" onClick={() => setShowWithdraw(true)}>Withdraw Funds</button>
          <button className="btn-report">Download Report</button>
        </div>
      </div>

      {showWithdraw && (
        <div className="inv-modal-backdrop" onClick={() => setShowWithdraw(false)}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div className="inv-modal-header-left">
                <span className="inv-modal-icon">💸</span>
                <div>
                  <div className="inv-modal-title">Withdraw Earnings</div>
                  <div className="inv-modal-subtitle">Available: TZS {paidEarnings.toLocaleString()}</div>
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
        <div className="flex justify-between items-center mb-lg flex-wrap gap-md">
          <div>
            <h2 className="text-lg fw-bold neutral-dark">Transaction History</h2>
            <p className="text-xs text-muted mt-xs">{sorted.length} transactions · Total: TZS {totalEarnings.toLocaleString()}</p>
          </div>
          <div className="flex gap-sm items-center">
            <div className="inv-search-wrap">
              <input className="inv-search" style={{ width: 200 }} placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-select" style={{ width: "auto" }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="pointer" onClick={() => handleSort("source")}>Source{getSortIcon("source")}</th>
                <th className="pointer" onClick={() => handleSort("amount")}>Amount{getSortIcon("amount")}</th>
                <th className="pointer" onClick={() => handleSort("date")}>Date{getSortIcon("date")}</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(e => (
                <tr key={e.id}>
                  <td className="fw-medium">{e.source}</td>
                  <td>
                    <span className="fw-semibold stat-change-positive">+ TZS {e.amount.toLocaleString()}</span>
                  </td>
                  <td className="text-sm">{e.date}</td>
                  <td>
                    {e.status === "paid" ? (
                      <span className="badge badge-success">● Paid</span>
                    ) : (
                      <span className="badge badge-warning">○ Pending</span>
                    )}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr><td colSpan={4} className="text-center text-muted">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
