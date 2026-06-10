import { useState } from "react";
import {
  HiUsers,
  HiStar,
  HiArrowUp,
  HiArrowDown,
  HiArrowsUpDown,
} from "react-icons/hi2";
import "../styles/provider.css";
import { HiClipboardList } from "react-icons/hi";

const monthlyStats = [
  { month: "Jan", customers: 120, bookings: 85, revenue: 2800000, rating: 4.6 },
  { month: "Feb", customers: 135, bookings: 92, revenue: 3100000, rating: 4.7 },
  { month: "Mar", customers: 140, bookings: 88, revenue: 2950000, rating: 4.7 },
  { month: "Apr", customers: 145, bookings: 95, revenue: 3300000, rating: 4.8 },
  { month: "May", customers: 148, bookings: 86, revenue: 3400000, rating: 4.8 },
];

const topServices = [
  { name: "Tractor Rental", bookings: 24, revenue: 2880000, rating: 4.8 },
  { name: "Fertilizer Supply", bookings: 32, revenue: 2080000, rating: 4.7 },
  { name: "Irrigation Setup", bookings: 18, revenue: 6300000, rating: 4.6 },
  { name: "Harvesting", bookings: 15, revenue: 3000000, rating: 4.5 },
  { name: "Soil Testing", bookings: 8, revenue: 360000, rating: 4.2 },
];

type MonthlyField = "month" | "customers" | "bookings" | "revenue" | "rating";
type TopServiceField = "name" | "bookings" | "revenue" | "rating";

export default function Analytics() {
  const [sortField, setSortField] = useState<MonthlyField>("month");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [topSortField, setTopSortField] = useState<TopServiceField>("revenue");
  const [topSortDir, setTopSortDir] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const totalRevenue = monthlyStats.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = monthlyStats.reduce((s, m) => s + m.bookings, 0);
  const totalCustomers = monthlyStats[monthlyStats.length - 1].customers;
  const avgRating = (monthlyStats.reduce((s, m) => s + m.rating, 0) / monthlyStats.length).toFixed(1);
  const maxRevenue = Math.max(...monthlyStats.map(m => m.revenue));
  const maxBookings = Math.max(...monthlyStats.map(m => m.bookings));

  const handleSort = (field: MonthlyField) => {
    if (sortField === field) setSortDir(p => p === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sorted = [...monthlyStats].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === "number" && typeof valB === "number") {
      return sortDir === "asc" ? valA - valB : valB - valA;
    }
    return sortDir === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  const handleTopSort = (field: TopServiceField) => {
    if (topSortField === field) setTopSortDir(p => p === "asc" ? "desc" : "asc");
    else { setTopSortField(field); setTopSortDir("asc"); }
  };

  const sortedTopServices = [...topServices].sort((a, b) => {
    const valA = a[topSortField];
    const valB = b[topSortField];
    if (typeof valA === "number" && typeof valB === "number") {
      return topSortDir === "asc" ? valA - valB : valB - valA;
    }
    return topSortDir === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  const toggleRow = (key: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const SortIcon = ({ field, currentField, currentDir }: { field: string; currentField: string; currentDir: string }) => {
    if (currentField !== field) return <HiArrowsUpDown className="sort-icon-inactive" />;
    return currentDir === "asc" ? <HiArrowUp className="sort-icon-active" /> : <HiArrowDown className="sort-icon-active" />;
  };

  const formatRevenue = (val: number) => {
    if (val >= 1000000) return `TZS ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `TZS ${(val / 1000).toFixed(0)}K`;
    return `TZS ${val}`;
  };

  return (
    <main className="customer-page">
      <div className="customer-page-header">
        <h1 className="customer-page-title">Analytics</h1>
        <p className="customer-page-subtitle">Service performance overview · May 2026</p>
      </div>

      <div className="dashboard-grid">
        <div className="dash-stat-card dash-stat-green">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-green">
              <HiUsers />
            </div>
            <div>
              <p className="dash-stat-label">Total Customers</p>
              <p className="dash-stat-value dash-stat-value-green">{totalCustomers}</p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-up">↑ 23% vs last quarter</span>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-gold">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-gold">
              <HiClipboardList />
            </div>
            <div>
              <p className="dash-stat-label">Total Bookings</p>
              <p className="dash-stat-value dash-stat-value-gold">{totalBookings}</p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-neutral">86 this month</span>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-amber">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-amber">
              <HiStar />
            </div>
            <div>
              <p className="dash-stat-label">Average Rating</p>
              <p className="dash-stat-value dash-stat-value-amber">{avgRating}</p>
            </div>
          </div>
          <div className="dash-stat-trend-row">
            <span className="dash-stat-trend dash-stat-trend-neutral">Across {monthlyStats.length} months</span>
          </div>
        </div>
      </div>

      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Revenue Trend</h2>
            <p className="dash-section-subtitle">Monthly revenue in TZS</p>
          </div>
          <span className="badge badge-success">↑ Growing</span>
        </div>
        <div className="analytics-chart-card">
          <div className="bar-chart-mini">
            {monthlyStats.map(m => (
              <div key={m.month} className="bar-chart-wrapper">
                <div
                  className="bar-mini bar-mini-green"
                  data-value={formatRevenue(m.revenue)}
                  style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                />
                <span className="bar-label bar-label-green">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Booking Volume</h2>
            <p className="dash-section-subtitle">Completed bookings per month</p>
          </div>
        </div>
        <div className="analytics-chart-card analytics-chart-card-blue">
          <div className="bar-chart-mini">
            {monthlyStats.map(m => (
              <div key={m.month} className="bar-chart-wrapper">
                <div
                  className="bar-mini bar-mini-blue"
                  data-value={`${m.bookings} bookings`}
                  style={{ height: `${(m.bookings / maxBookings) * 100}%` }}
                />
                <span className="bar-label bar-label-blue">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Services */}
      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Top Performing Services</h2>
            <p className="dash-section-subtitle">Sorted by revenue</p>
          </div>
        </div>
        <div className="table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleTopSort("name")}>
                    Service <SortIcon field="name" currentField={topSortField} currentDir={topSortDir} />
                  </th>
                  <th onClick={() => handleTopSort("bookings")}>
                    Bookings <SortIcon field="bookings" currentField={topSortField} currentDir={topSortDir} />
                  </th>
                  <th onClick={() => handleTopSort("revenue")}>
                    Revenue <SortIcon field="revenue" currentField={topSortField} currentDir={topSortDir} />
                  </th>
                  <th onClick={() => handleTopSort("rating")}>
                    Rating <SortIcon field="rating" currentField={topSortField} currentDir={topSortDir} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTopServices.map(s => (
                  <tr
                    key={s.name}
                    className={expandedRows.has(s.name) ? "expanded" : ""}
                    onClick={() => toggleRow(s.name)}
                  >
                    <td className="td-priority fw-medium" data-label="Service">{s.name}</td>
                    <td className="td-secondary" data-label="Bookings">{s.bookings}</td>
                    <td className="td-secondary fw-semibold" data-label="Revenue">TZS {s.revenue.toLocaleString()}</td>
                    <td className="td-secondary" data-label="Rating">
                      <span className="rating-cell">
                        <HiStar className="rating-star" />
                        {s.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Monthly Breakdown */}
      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Monthly Breakdown</h2>
            <p className="dash-section-subtitle">Detailed month-by-month data</p>
          </div>
        </div>
        <div className="table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("month")}>
                    <span>Month</span><SortIcon field="month" currentField={sortField} currentDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort("customers")}>
                    <span>Customers</span><SortIcon field="customers" currentField={sortField} currentDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort("bookings")}>
                    <span>Bookings</span><SortIcon field="bookings" currentField={sortField} currentDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort("revenue")}>
                    <span>Revenue</span><SortIcon field="revenue" currentField={sortField} currentDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort("rating")}>
                    <span>Rating</span><SortIcon field="rating" currentField={sortField} currentDir={sortDir} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(m => (
                  <tr
                    key={m.month}
                    className={expandedRows.has(m.month) ? "expanded" : ""}
                    onClick={() => toggleRow(m.month)}
                  >
                    <td className="td-priority fw-medium" data-label="Month">{m.month}</td>
                    <td className="td-secondary" data-label="Customers">{m.customers}</td>
                    <td className="td-secondary" data-label="Bookings">{m.bookings}</td>
                    <td className="td-secondary fw-semibold" data-label="Revenue">TZS {m.revenue.toLocaleString()}</td>
                    <td className="td-secondary" data-label="Rating">
                      <span className="rating-cell">
                        <HiStar className="rating-star" />
                        {m.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
