import { useState } from "react";
import "../styles/provider.css";

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

export default function Analytics() {
  const [sortField, setSortField] = useState<"month" | "customers" | "bookings" | "revenue" | "rating">("month");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const totalRevenue = monthlyStats.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = monthlyStats.reduce((s, m) => s + m.bookings, 0);
  const totalCustomers = monthlyStats[monthlyStats.length - 1].customers;
  const avgRating = (monthlyStats.reduce((s, m) => s + m.rating, 0) / monthlyStats.length).toFixed(1);
  const maxRevenue = Math.max(...monthlyStats.map(m => m.revenue));
  const maxBookings = Math.max(...monthlyStats.map(m => m.bookings));

  const handleSort = (field: typeof sortField) => {
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

  const getSortIcon = (field: string) => sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕";

  const formatRevenue = (val: number) => {
    if (val >= 1000000) return `TZS ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `TZS ${(val / 1000).toFixed(0)}K`;
    return `TZS ${val}`;
  };

  return (
    <main className="p-xl">
      <div className="mb-xl">
        <h1 className="text-2xl fw-bold neutral-dark">Analytics</h1>
        <p className="text-sm text-muted mt-xs">Service performance overview · May 2026</p>
      </div>

      {/* KPI Cards */}
      <div className="provider-stats-grid">
        <div className="earnings-stat-card earnings-stat-card-green">
          <div className="flex items-center gap-md mb-lg">
            <div className="earnings-stat-icon earnings-stat-icon-green">👥</div>
            <div>
              <p className="earnings-stat-label">Total Customers</p>
              <p className="earnings-stat-value" style={{ color: "#2E7D4F" }}>{totalCustomers}</p>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="badge badge-success text-xs">↑ 23%</span>
            <span className="text-xs text-muted">vs last quarter</span>
          </div>
        </div>
        <div className="earnings-stat-card earnings-stat-card-gold">
          <div className="flex items-center gap-md mb-lg">
            <div className="earnings-stat-icon earnings-stat-icon-gold">📋</div>
            <div>
              <p className="earnings-stat-label">Total Bookings</p>
              <p className="earnings-stat-value" style={{ color: "#8C7A48" }}>{totalBookings}</p>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-xs text-muted">86 this month</span>
          </div>
        </div>
        <div className="earnings-stat-card earnings-stat-card-amber">
          <div className="flex items-center gap-md mb-lg">
            <div className="earnings-stat-icon earnings-stat-icon-amber">⭐</div>
            <div>
              <p className="earnings-stat-label">Average Rating</p>
              <p className="earnings-stat-value" style={{ color: "#9C8B3D" }}>{avgRating}</p>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-xs text-muted">Across {monthlyStats.length} months</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <section className="mt-xl" style={{
        background: "white", borderRadius: 16, padding: 24,
        border: "1px solid rgba(75,129,91,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
      }}>
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="text-lg fw-bold neutral-dark">Revenue Trend</h2>
            <p className="text-xs text-muted mt-xs">Monthly revenue in TZS</p>
          </div>
          <span className="badge badge-success text-xs">↑ Growing</span>
        </div>
        <div className="bar-chart-mini">
          {monthlyStats.map(m => (
            <div key={m.month} className="bar-chart-wrapper">
              <div
                className="bar-mini"
                data-value={formatRevenue(m.revenue)}
                style={{
                  height: `${(m.revenue / maxRevenue) * 100}%`,
                  background: "linear-gradient(180deg, #4B815B 0%, #8CBF9A 100%)",
                }}
              />
              <span className="bar-label" style={{ color: "#4B815B" }}>{m.month}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bookings Chart */}
      <section className="mt-lg" style={{
        background: "white", borderRadius: 16, padding: 24,
        border: "1px solid rgba(58,123,213,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
      }}>
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="text-lg fw-bold neutral-dark">Booking Volume</h2>
            <p className="text-xs text-muted mt-xs">Completed bookings per month</p>
          </div>
        </div>
        <div className="bar-chart-mini">
          {monthlyStats.map(m => (
            <div key={m.month} className="bar-chart-wrapper">
              <div
                className="bar-mini"
                data-value={`${m.bookings} bookings`}
                style={{
                  height: `${(m.bookings / maxBookings) * 100}%`,
                  background: "linear-gradient(180deg, #3A7BD5 0%, #8BB5E8 100%)",
                }}
              />
              <span className="bar-label" style={{ color: "#3A7BD5" }}>{m.month}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top Services */}
      <section className="mt-lg">
        <h2 className="text-lg fw-bold neutral-dark mb-lg">Top Performing Services</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Service</th><th>Bookings</th><th>Revenue</th><th>Rating</th></tr>
            </thead>
            <tbody>
              {topServices.map(s => (
                <tr key={s.name}>
                  <td className="fw-medium">{s.name}</td>
                  <td>{s.bookings}</td>
                  <td className="fw-semibold">TZS {s.revenue.toLocaleString()}</td>
                  <td>⭐ {s.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Monthly Table */}
      <section className="mt-lg">
        <h2 className="text-lg fw-bold neutral-dark mb-lg">Monthly Breakdown</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="pointer" onClick={() => handleSort("month")}>Month{getSortIcon("month")}</th>
                <th className="pointer" onClick={() => handleSort("customers")}>Customers{getSortIcon("customers")}</th>
                <th className="pointer" onClick={() => handleSort("bookings")}>Bookings{getSortIcon("bookings")}</th>
                <th className="pointer" onClick={() => handleSort("revenue")}>Revenue{getSortIcon("revenue")}</th>
                <th className="pointer" onClick={() => handleSort("rating")}>Rating{getSortIcon("rating")}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(m => (
                <tr key={m.month}>
                  <td className="fw-medium">{m.month}</td>
                  <td>{m.customers}</td>
                  <td>{m.bookings}</td>
                  <td className="fw-semibold">TZS {m.revenue.toLocaleString()}</td>
                  <td>⭐ {m.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
