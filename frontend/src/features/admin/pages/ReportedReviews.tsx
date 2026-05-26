import { useState } from "react";

const demoReported = [
  { id: "REP-001", reviewId: "REV-008", reportedBy: "Kilimo Best", reason: "False claims", comment: "This review contains inaccurate information about our service", status: "pending", reportedDate: "2026-05-19" },
  { id: "REP-002", reviewId: "REV-012", reportedBy: "AgriPro", reason: "Offensive language", comment: "Customer used inappropriate language", status: "pending", reportedDate: "2026-05-18" },
  { id: "REP-003", reviewId: "REV-005", reportedBy: "Farm Help", reason: "Competitor review", comment: "We suspect this is a fake review from a competitor", status: "under-review", reportedDate: "2026-05-17" },
  { id: "REP-004", reviewId: "REV-015", reportedBy: "Green Tech", reason: "Spam", comment: "This appears to be a spam review", status: "resolved", reportedDate: "2026-05-15" },
];

export default function ReportedReviews() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reported Reviews</h1>
        <p className="page-subtitle">Review and moderate reported content</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Reports</div>
            <div className="inv-toolbar-sub">{demoReported.length} reported reviews</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Review</th>
              <th>Reported By</th>
              <th>Reason</th>
              <th>Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoReported.map(report => (
              <tr key={report.id}>
                <td className="fw-medium">{report.id}</td>
                <td>{report.reviewId}</td>
                <td>{report.reportedBy}</td>
                <td><span className="badge badge-danger">{report.reason}</span></td>
                <td className="text-muted">{report.comment}</td>
                <td>
                  {report.status === "pending" && <span className="badge badge-warning">Pending</span>}
                  {report.status === "under-review" && <span className="badge badge-info">Under Review</span>}
                  {report.status === "resolved" && <span className="badge badge-success">Resolved</span>}
                </td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-danger">Remove Review</button>
                    <button className="inv-action-btn inv-action-btn-success">Dismiss Report</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
