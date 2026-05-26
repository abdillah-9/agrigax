import { useState } from "react";

const demoPerformance = [
  { provider: "Kilimo Best Supplies", totalBookings: 145, completedBookings: 138, completionRate: "95%", avgRating: 4.8, responseTime: "12 min", revenue: 14500000 },
  { provider: "AgriPro Solutions", totalBookings: 112, completedBookings: 105, completionRate: "94%", avgRating: 4.5, responseTime: "25 min", revenue: 9800000 },
  { provider: "Farm Help Services", totalBookings: 89, completedBookings: 80, completionRate: "90%", avgRating: 4.2, responseTime: "18 min", revenue: 7200000 },
  { provider: "Green Tech Agri", totalBookings: 67, completedBookings: 58, completionRate: "87%", avgRating: 4.6, responseTime: "35 min", revenue: 5400000 },
  { provider: "Tanzania Livestock Co", totalBookings: 98, completedBookings: 95, completionRate: "97%", avgRating: 4.9, responseTime: "8 min", revenue: 12500000 },
];

export default function PerformanceReports() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Performance Reports</h1>
        <p className="page-subtitle">Provider performance and service quality metrics</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Provider Performance</div>
            <div className="inv-toolbar-sub">{demoPerformance.length} providers</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search providers..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Total Bookings</th>
              <th>Completed</th>
              <th>Completion Rate</th>
              <th>Avg Rating</th>
              <th>Response Time</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {demoPerformance.filter(p => p.provider.toLowerCase().includes(search.toLowerCase())).map(perf => (
              <tr key={perf.provider}>
                <td className="fw-medium">{perf.provider}</td>
                <td>{perf.totalBookings}</td>
                <td>{perf.completedBookings}</td>
                <td><span className="badge badge-success">{perf.completionRate}</span></td>
                <td>⭐ {perf.avgRating}</td>
                <td>{perf.responseTime}</td>
                <td>TZS {perf.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
