import { useState } from "react";
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <HiArrowsUpDown className="sort-icon-inactive" />;
    return sortDir === "asc" ? <HiArrowUp className="sort-icon-active" /> : <HiArrowDown className="sort-icon-active" />;
  };

  return (
    <main className="customer-page">
      {/* Page Header */}
      <div className="customer-page-header">
        <h1 className="customer-page-title">Earnings</h1>
        <p className="customer-page-subtitle">Track your revenue and payouts · May 2026</p>
      </div>

      {/* Stats Row */}
      <div className="dashboard-grid">
        <div className="dash-stat-card dash-stat-green">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-green">
              <HiCurrencyDollar />
            </div>
            <div>
              <p className="dash-stat-label">Total Earnings</p>
              <p className="dash-stat-value dash-stat-value-green">TZS {totalEarnings.toLocaleString()}</p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-up">↑ 18% vs last month</span>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-gold">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-gold">
              <HiBuildingOffice />
            </div>
            <div>
              <p className="dash-stat-label">Available Balance</p>
              <p className="dash-stat-value dash-stat-value-gold">TZS {paidEarnings.toLocaleString()}</p>
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
              <p className="dash-stat-label">Pending Clearance</p>
              <p className="dash-stat-value dash-stat-value-amber">TZS {pendingEarnings.toLocaleString()}</p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-warning">
              {earningHistory.filter(e => e.status === "pending").length} payments
            </span>
          </div>
        </div>
      </div>

      {/* Action Card */}
      <div className="earnings-action-card">
        <div className="earnings-action-left">
          <div className="earnings-action-icon-wrap">
            <HiCreditCard className="earnings-action-icon-svg" />
          </div>
          <div>
            <p className="earnings-action-title">Ready to withdraw?</p>
            <p className="earnings-action-subtitle">Transfer via M-Pesa, Tigo Pesa, Airtel Money or Bank</p>
          </div>
        </div>
        <div className="earnings-action-buttons">
          <button className="btn-withdraw" onClick={() => setShowWithdraw(true)}>Withdraw Funds</button>
          <button className="btn-report">Download Report</button>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="provider-modal-backdrop" onClick={() => setShowWithdraw(false)}>
          <div className="provider-modal" onClick={e => e.stopPropagation()}>
            <div className="provider-modal-header">
              <div className="provider-modal-header-left">
                <div className="provider-modal-icon-wrap provider-modal-icon-withdraw">
                  <HiCurrencyDollar />
                </div>
                <div>
                  <h3 className="provider-modal-title">Withdraw Earnings</h3>
                  <p className="provider-modal-subtitle">Available: TZS {paidEarnings.toLocaleString()}</p>
                </div>
              </div>
              <button className="provider-modal-close" onClick={() => setShowWithdraw(false)}>
                <HiXMark />
              </button>
            </div>
            <div className="provider-modal-body">
              <div className="provider-form-grid">
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
            <div className="provider-modal-footer">
              <button className="btn-report" onClick={() => setShowWithdraw(false)}>Cancel</button>
              <button className="btn-withdraw" onClick={() => { alert("Withdrawal request submitted!"); setShowWithdraw(false); }}>Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Transaction History</h2>
            <p className="dash-section-subtitle">{sorted.length} transactions · Total: TZS {totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        {/* Table Card */}
        <div className="table-card">
          {/* Unified Toolbar — adapts on mobile via CSS */}
          <div className="earnings-table-toolbar">
            <div className="table-search-wrap earnings-search-wrap">
              <HiMagnifyingGlass className="table-search-icon" />
              <input
                className="table-search-input"
                placeholder="Search transactions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="earnings-toolbar-right">
              <span className="table-toolbar-count">{sorted.length} records</span>
              <select className="input-select table-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="table-responsive">
            <table className="data-table data-table-earnings">
              <thead>
                <tr>
                  {/* <th className="sortable-th col-source" onClick={() => handleSort("source")}>
                    <span>Source2</span><SortIcon field="source" />
                  </th>
                  <th className="sortable-th col-amount" onClick={() => handleSort("amount")}>
                    <span>Amount</span><SortIcon field="amount" />
                  </th>
                  <th className="sortable-th col-date" onClick={() => handleSort("date")}>
                    <span>Date</span><SortIcon field="date" />
                  </th> */}
                  <th className="col-status" onClick={() => handleSort("source")}>
                      <span>Source2</span><SortIcon field="source" />
                  </th>
                  <th className="col-status" onClick={() => handleSort("amount")}>
                      <span>Amount</span><SortIcon field="amount" />
                  </th>
                  <th className="col-status"  onClick={() => handleSort("date")}>
                    <span>Date</span><SortIcon field="date" />
                  </th>
                  <th className="col-status">
                    <span>Status</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(e => (
                  <tr
                    key={e.id}
                    className={expandedRows.has(e.id) ? "expanded" : ""}
                    onClick={() => toggleRow(e.id)}
                  >
                    <td className="td-priority" data-label="Source">
                      <span className="td-source-text">{e.source}</span>
                    </td>
                    <td className="td-priority td-amount-positive" data-label="Amount">
                      + TZS {e.amount.toLocaleString()}
                    </td>
                    <td className="td-secondary" data-label="Date">
                      <span className="td-date-text">{e.date}</span>
                    </td>
                    <td className="td-secondary" data-label="Status">
                      {e.status === "paid" ? (
                        <span className="badge badge-success">Paid</span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={4} className="table-empty-cell">
                      <div className="table-empty-state">
                        <HiMagnifyingGlass className="table-empty-icon" />
                        <p>No transactions found</p>
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
